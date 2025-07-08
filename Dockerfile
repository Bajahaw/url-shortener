FROM ghcr.io/graalvm/native-image-community:24-muslib AS build

# Install necessary tools
RUN microdnf install wget xz findutils

WORKDIR /app

COPY . .

# compile native image
RUN ./gradlew nativeCompile --no-daemon


# Install UPX (Ultimate Packer for eXecutables) to compress even more.
RUN wget https://github.com/upx/upx/releases/download/v4.2.4/upx-4.2.4-amd64_linux.tar.xz
RUN tar xvf upx-4.2.4-amd64_linux.tar.xz

# Set up the environment variables required to run the UPX command.
ENV UPX_HOME=/app/upx-4.2.4-amd64_linux
ENV PATH=$UPX_HOME:$PATH

RUN upx -7 -k /app/build/native/nativeCompile/url-shortener

# absolute minimalism ..
FROM scratch

WORKDIR /app

# copy the native executable from the build stage
COPY --from=build /app/build/native/nativeCompile/url-shortener /app/shortener

# start the application
CMD ["./shortener"]