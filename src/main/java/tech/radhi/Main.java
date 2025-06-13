package tech.radhi;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.logging.Logger;

public class Main {

    private static final Logger log = Logger.getLogger(Main.class.getName());
    private static final ConcurrentMap<String,String> map = new ConcurrentHashMap<>();
    private static final SecureRandom random = new SecureRandom();
    private static final char[] alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final String baseUrl = "https://url.radhi.tech/";
    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {

        // todo: db logic
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/shorten", exchange -> {
            String src = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            log.info("URL is being shortened: " + src);

            // todo: check validity of src before generating
            String key = generateKey(6);

            // todo: use map only for caching
            map.put(key, src);

            // send shortened url back as string
            String url = baseUrl + key;
            byte[] res = url.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, res.length);
            exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
            exchange.getResponseBody().write(res);
            exchange.close();
        });

        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            // todo: validate nested paths as well
            String key = path.split("/")[1];
            log.info("A request at: " + path + " - key: " + key);

            // getting destination url
            String target = map.get(key);
            if (target == null) {
                var msg = "Target url not found!";
                byte[] res = msg.getBytes(StandardCharsets.UTF_8);
                log.warning(msg + " - Key: " + key);

                // write response body
                exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
                exchange.sendResponseHeaders(404, res.length);
                exchange.getResponseBody().write(res);

            }
            else {
                // forwarding to destination url
                exchange.getResponseHeaders().add("Location", target);
                exchange.sendResponseHeaders(302, -1);
            }

            exchange.close();
        });

        server.start();
        log.info("Started Server at " + PORT);
    }

    private static String generateKey(int len) {
        StringBuilder key = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            char chr = alphabet[random.nextInt(alphabet.length)];
            key.append(chr);
        }
        return key.toString();
    }
}