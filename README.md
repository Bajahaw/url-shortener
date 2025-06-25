# URL Shortener

This project is a URL shortener application built with plain Java, Gradle, GraalVM Native Image, and PostgreSQL for storing the URL mappings.

## Features

* **URL Shortening**: Provides an endpoint `/shorten` to convert long URLs into short ones.
* **Redirection**: Redirects to the original URL when a shortened URL is accessed.
* **Native Executable**: Can be packaged as a native executable using GraalVM, resulting in a small and fast application.
* **Docker Support**: Includes a `Dockerfile` for easy containerization.
* **PostgreSQL Integration**: Uses PostgreSQL for persistent storage of URL mappings.
* **Custom Logging**: Implements a custom logging setup for colored and timestamped console output.
