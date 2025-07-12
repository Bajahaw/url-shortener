import type {UrlAnalysis, ShortenResponse} from "../types";

const baseUrl = "http://localhost:8080"

/**
 * Sends a request to the URL shortening API endpoint.
 * @param url - The original URL to shorten.
 * @returns A promise resolving with the ShortenResponse.
 * @throws Error if the network request fails or returns a non-OK status.
 */
export async function shortenUrl(url: string): Promise<ShortenResponse> {
    const response = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
        },
        body: url,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const shortUrl = await response.text();
    const key = shortUrl.split("/").pop() || "";

    return {
        shortUrl,
        originalUrl: url,
        key,
    };
}

/**
 * Analyzes the origin of a shortened URL.
 * It sends a request to /check with string body of the shortened URL.
 * the response is a plain text containing the origin of the URL.
 *
 * @param url - The shortened URL to analyze.
 * @returns A promise resolving with the UrlAnalysis object.
 */
export async function analyzeUrlOrigin(url: string): Promise<UrlAnalysis> {
    const response = await fetch(`${baseUrl}/check`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
        },
        body: url,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const origin = await response.text();
    return {origin, error: ""};
}

/**
 * Checks the health status of the backend API.
 * @returns A promise resolving with true if the API is healthy; false otherwise.
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${baseUrl}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
