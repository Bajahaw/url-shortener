export interface UrlAnalysis {
  /**
   * The origin of the URL (e.g., protocol + host).
   */
  origin: string;
  /**
   * Optional error message if analysis failed (e.g., invalid URL).
   */
  error?: string;
}

export interface ShortenResponse {
  /**
   * The generated short URL.
   */
  shortUrl: string;
  /**
   * The original URL that was shortened.
   */
  originalUrl: string;
  /**
   * The unique key associated with the shortened URL.
   */
  key: string;
}
