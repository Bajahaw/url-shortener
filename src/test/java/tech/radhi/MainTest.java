package tech.radhi;

import org.junit.jupiter.api.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.*;

class MainTest {
    private static HttpClient client;
    private static final String BASE = "http://localhost:8080";

    @BeforeAll
    static void startServer() throws IOException {
        // Set the BASE_URL environment variable for testing
        System.setProperty("BASE_URL", BASE);
        LoggingSetup.configure();
        Controller.start();
        client = HttpClient.newHttpClient();
    }

    @Test
    void testShortenWithGetBody() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/shorten"))
                .method("GET", HttpRequest.BodyPublishers.ofString("http://url.com"))
                .header("Content-Type", "text/plain")
                .build();

        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, resp.statusCode());
        assertTrue(resp.body().startsWith(BASE + "/"));
        assertTrue(Pattern.matches(".*/[a-zA-Z]{6}", resp.body()));
    }

    @Test
    void testShortenValidPost() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/shorten"))
                .POST(HttpRequest.BodyPublishers.ofString("https://example.com"))
                .build();

        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, resp.statusCode());
        assertTrue(resp.body().startsWith(BASE + "/"));
        assertTrue(Pattern.matches(".*/[a-zA-Z]{6}", resp.body()));
    }

    @Test
    void testShortenInvalidUrl() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/shorten"))
                .POST(HttpRequest.BodyPublishers.ofString("not-a-url"))
                .build();

        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Not valid URL"));
    }

    @Test
    void testInvalidPathRandomRandom() throws Exception {
        var resp = client.send(
                HttpRequest.newBuilder()
                        .uri(URI.create(BASE + "/random/random"))
                        .GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );
        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid path"));
    }

    @Test
    void testInvalidPathRandom() throws Exception {
        var resp = client.send(
                HttpRequest.newBuilder()
                        .uri(URI.create(BASE + "/a/b/c"))
                        .GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );
        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid path"));
    }

    @Test
    void testWrongShortenPath() throws Exception {
        var resp = client.send(
                HttpRequest.newBuilder()
                        .uri(URI.create(BASE + "/shorten/1234567890"))
                        .GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );
        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid path"));
    }

    @Test
    void testWrongShortenPathWithQuery() throws Exception {
        var resp = client.send(
                HttpRequest.newBuilder()
                        .uri(URI.create(BASE + "/shorten/1234567890?url=http://example.com"))
                        .GET().build(),
                HttpResponse.BodyHandlers.ofString()
        );
        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid path"));
    }

    @Test
    void testRedirectFound() throws Exception {
        var create = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/shorten"))
                .POST(HttpRequest.BodyPublishers.ofString("https://openai.com"))
                .build();
        var r1 = client.send(create, HttpResponse.BodyHandlers.ofString());
        String key = r1.body().substring(r1.body().lastIndexOf('/') + 1);

        // follow redirect
        var redirect = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/" + key))
                .GET().build();
        var r2 = client.send(redirect, HttpResponse.BodyHandlers.discarding());

        assertEquals(302, r2.statusCode());
        assertEquals("https://openai.com", r2.headers().firstValue("Location").orElse(""));
    }

    @Test
    void testRedirectNotFound() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/foobar"))
                .GET().build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals(404, resp.statusCode());
        assertTrue(resp.body().contains("Target url not found"));
    }

    @Test
    void testHealthEndpoint() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/health"))
                .GET().build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertTrue(resp.statusCode() == 200 || resp.statusCode() == 503);
        if (resp.statusCode() == 200) {
            assertEquals("OK", resp.body());
        } else {
            assertTrue(resp.body().contains("Health check failed"));
        }
    }

    @Test
    void testCheckValidShortenedUrl() throws Exception {
        // First create a shortened URL
        var createReq = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/shorten"))
                .POST(HttpRequest.BodyPublishers.ofString("https://github.com"))
                .build();
        var createResp = client.send(createReq, HttpResponse.BodyHandlers.ofString());
        String shortenedUrl = createResp.body();

        // Now check the shortened URL
        var checkReq = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString(shortenedUrl))
                .build();
        var checkResp = client.send(checkReq, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, checkResp.statusCode());
        assertEquals("https://github.com", checkResp.body());
    }

    @Test
    void testCheckInvalidUrl() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString("not-a-valid-url"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid URL"));
    }

    @Test
    void testCheckThirdPartyUrl() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString("https://example.com/abc123"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Checking 3rd party URLs is not yet supported"));
    }

    @Test
    void testCheckNonExistentKey() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString(BASE + "/notfnd"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(404, resp.statusCode());
        assertTrue(resp.body().contains("Target url not found"));
    }

    @Test
    void testCheckEmptyBody() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString(""))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid URL"));
    }

    @Test
    void testCheckUrlWithoutScheme() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString("url.radhi.tech/abc123"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid URL"));
    }

    @Test
    void testCheckUrlWithoutHost() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .POST(HttpRequest.BodyPublishers.ofString("https:///abc123"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(400, resp.statusCode());
        assertTrue(resp.body().contains("Invalid URL"));
    }

    @Test
    void testCheckWithGetMethod() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/check"))
                .method("GET", HttpRequest.BodyPublishers.ofString(BASE + "/abc123"))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());

        assertEquals(404, resp.statusCode());
        assertTrue(resp.body().contains("Target url not found"));
    }
}