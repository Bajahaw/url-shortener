package tech.radhi;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

public class Controller {

    private static final Logger log = Logger.getLogger(Controller.class.getName());
    private static final Map<String, String> cache = Collections.synchronizedMap(new SizedLinkedHashMap<>(1024));
    private static final String BASE_URL = Utils.getEnvOrElse("BASE_URL", "http://localhost:8080/");
    private static final int PORT = Integer.parseInt(Utils.getEnvOrElse("SERVER_PORT", "8080"));

    /**
     * Main method to start the server and create the needed endpoints.
     *
     * @throws IOException if an I/O error occurs
     */
    public static void start() throws IOException {

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Controller endpoints
        server.createContext("/shorten", Controller::shorten);
        server.createContext("/health", Controller::health);
        server.createContext("/", Controller::redirect);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("Shutting down...");
            server.stop(0);
        }));

        server.start();
        log.info("Started Http Server at port: " + PORT);
    }

    /**
     * endpoint to shorten a URL.
     *
     * @param exchange for handling http requests
     */
    private static void shorten(HttpExchange exchange) {
        if (handleCorsPreflight(exchange)) return;
        String path = exchange.getRequestURI().getPath();
        if (!path.equals("/shorten")) {
            String msg = "Invalid path: " + path;
            exchangeTextResponse(exchange, msg, 400);
            return;
        }

        String src = null;
        try {
            src = new String(
                    exchange.getRequestBody().readAllBytes(),
                    StandardCharsets.UTF_8
            );
            // validate input by creating a URI
            var url = URI.create(src);
            if (url.getScheme()==null || url.getHost()==null) {
                throw new IllegalArgumentException("Missing scheme or host");
            }

        } catch (Exception e) {
            String msg = "Not valid URL: '" + src + "' - " + e.getMessage();
            exchangeTextResponse(exchange, msg, 400);
            return;
        }

        if (src.length() > 1000) {
            String msg = "URL exceeds length limit: " + src.substring(0, 100);
            exchangeTextResponse(exchange, msg, 400);
            return;
        }

        String key = Utils.generateKey(6);

        // Saving source url in cache as well as in db
        // no need to synchronize cuz cache is Collections.synchronizedMap
        cache.put(key, src);
        DataSource.save(key, src);

        // send shortened url back as string
        String url = BASE_URL + key;
        exchangeTextResponse(exchange, url, 200);
    }

    /**
     * endpoint to redirect to the original URL.
     * It will look for the key in the map and
     * redirect to the original URL.
     *
     * @param exchange for handling http requests
     */
    private static void redirect(HttpExchange exchange) {
        if (handleCorsPreflight(exchange)) return;
        String path = exchange.getRequestURI().getPath();
        String key = path.substring(1);

        if (!path.startsWith("/") || key.length() != 6 || !key.matches("[a-zA-Z]+")) {
            String msg = "Invalid path: " + path;
            exchangeTextResponse(exchange, msg, 400);
            return;
        }

        // getting destination url
        String cached = cache.get(key);
        String target = cached != null ? cached : DataSource.getUrl(key);
        if (target == null) {
            String msg = "Target url not found! - Key: " + key;
            exchangeTextResponse(exchange, msg, 404);
            return;

        } else if (cached == null) {
            cache.put(key, target);
        }

        // forwarding to destination url
        try (exchange) {
            exchange.getResponseHeaders().add("Location", target);
            exchange.sendResponseHeaders(302, -1);
        } catch (IOException e) {
            log.severe("Could not redirect: " + e.getMessage());
        }
    }

    /**
     * Basic check for overall functionality of the app.
     * It sends a ping to the datasource as well to
     * check db connection
     *
     * @param exchange for handling http requests
     */
    private static void health(HttpExchange exchange) {
        if (handleCorsPreflight(exchange)) return;
        boolean dbOk = DataSource.health();

        if (!dbOk) {
            String msg = "Health check failed: DataSource is not connected!";
            log.severe(msg);
            exchangeTextResponse(exchange, msg, 503);
            return;
        }
        log.info("Health check completed");
        exchangeTextResponse(exchange, "OK", 200);
    }


    /**
     * Helper method to avoid boiler.
     * It is used to send only text responses with relevant status code
     *
     * @param exchange the same exchange used by the endpoint
     * @param body the response body
     * @param code the response status code
     */
    private static void exchangeTextResponse(HttpExchange exchange, String body, int code) {
        byte[] res = body.getBytes(StandardCharsets.UTF_8);

        if (code != 200) log.warning(
                "Error happened! Sending " + code + " response: " + body
        );

        // write response body
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        try (exchange) {
            exchange.sendResponseHeaders(code, res.length);
            exchange.getResponseBody().write(res);
        } catch (IOException e) {
            log.severe("Error happened while Sending " + code + " response: " + body + " - " + e.getMessage());
        }
    }

    /**
     * Helper method to handle CORS preflight requests.
     * It adds the necessary headers to the response.
     *
     * @param exchange the HttpExchange object
     */
    private static boolean handleCorsPreflight(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                exchange.sendResponseHeaders(204, -1);
                return true;

            } catch (IOException e) {
                log.severe("Error handling CORS preflight request: " + e.getMessage());
            }
        }
        return false;
    }
}
