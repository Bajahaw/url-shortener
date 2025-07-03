package tech.radhi;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

public class Controller {

    private static final Logger log = Logger.getLogger(Controller.class.getName());
    private static final ConcurrentMap<String, String> map = new ConcurrentHashMap<>();
    private static final SecureRandom random = new SecureRandom();
    private static final char[] alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final String baseUrl = "https://url.radhi.tech/";
    private static final int PORT = 8080;

    /**
     * Main method to start the server and create the needed endpoints.
     *
     * @throws IOException if an I/O error occurs
     */
    public static void start() throws IOException {

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Controller endpoints
        server.createContext("/shorten", Controller::shorten);
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
        String src = null;
        try {
            src = new String(
                    exchange.getRequestBody().readAllBytes(),
                    StandardCharsets.UTF_8
            );
            // validate input by creating a URI
            var _ = URI.create(src);

        } catch (Exception e) {
            var msg = "Not valid URL: '" + src + "' - " + e.getMessage();
            exchangeTextResponse(exchange, msg, 400);
            exchange.close();
            return;
        }

        if (src.length() >= 1000) {
            var msg = "Invalid URL! URL either empty or too long.";
            exchangeTextResponse(exchange, msg, 400);
            exchange.close();
            return;
        }

        String key = generateKey(6);
        // todo: use map only for caching
        // map.put(key, src);
        DataSource.save(key, src);

        // send shortened url back as string
        String url = baseUrl + key;
        exchangeTextResponse(exchange, url, 200);
        exchange.close();
    }

    /**
     * endpoint to redirect to the original URL.
     * It will look for the key in the map and redirect to the original URL.
     *
     * @param exchange for handling http requests
     */
    private static void redirect(HttpExchange exchange) {
        String path = exchange.getRequestURI().getPath();
        String key = path.substring(1);

        if (!path.startsWith("/") || key.length() != 6 || !key.matches("[a-zA-Z]+")) {
            var msg = "Invalid path: " + path;
            exchangeTextResponse(exchange, msg, 400);
            exchange.close();
            return;
        }

        // getting destination url
        // String target = map.get(key);
        String target = DataSource.getUrl(key);
        if (target == null) {
            var msg = "Target url not found! - Key: " + key;
            exchangeTextResponse(exchange, msg, 404);
        } else {
            // forwarding to destination url
            exchange.getResponseHeaders().add("Location", target);
            try { exchange.sendResponseHeaders(302, -1); }
            catch (IOException e) {
                log.severe("Could not redirect: " + e.getMessage());
            }
        }

        exchange.close();
    }

    /**
     * The following method is just a helper to avoid boiler.
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
        try {
            exchange.sendResponseHeaders(code, res.length);
            exchange.getResponseBody().write(res);
        } catch (IOException e) {
            log.severe("Error happened while Sending " + code + " response: " + body + " - " + e.getMessage());
        }
    }

    /**
     * Helper method for generating random and unique key
     *
     * @param len The length of the required key
     * @return the generated key as String
     */
    private static String generateKey(int len) {
        StringBuilder key = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int rnd = random.nextInt(alphabets.length);
            char chr = alphabets[rnd];
            key.append(chr);
        }
        return key.toString();
    }
}
