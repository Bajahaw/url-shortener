package tech.radhi;

import org.postgresql.ds.PGSimpleDataSource;

import java.sql.*;
import java.util.logging.Logger;

public class DataSource {

    private final static Logger log = Logger.getLogger(DataSource.class.getName());

    private static final String url = getEnvOrElse("DATABASE_URL", "localhost:5432");
    private static final String username = getEnvOrElse("DATABASE_USERNAME", "user");
    private static final String password = getEnvOrElse("DATABASE_PASSWORD", "pass");
    private static final String dbName = getEnvOrElse("DATABASE_NAME", "urls");

    private static final PGSimpleDataSource dataSource = new PGSimpleDataSource();


    public static void connect() {

        dataSource.setServerNames(new String[]{url});
        dataSource.setDatabaseName(dbName);
        dataSource.setUser(username);
        dataSource.setPassword(password);

        try (var connection = dataSource.getConnection();
             var statement = connection.createStatement()) {
            String sql = """
                    CREATE TABLE IF NOT EXISTS urls (
                      id VARCHAR(10) PRIMARY KEY,
                      url TEXT NOT NULL
                    );
                    """;
            var result = statement.execute(sql);
            if (result) log.info("Successfully created table urls");
            else log.info("Table urls exists!");

        } catch (SQLException e) {
            log.severe("Failed to connect to database - " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static void save(String key, String url) {
        var sql = "INSERT INTO urls VALUES (?, ?)";
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {

            statement.setString(1, key);
            statement.setString(2, url);
            statement.execute();

        } catch (SQLException e) {
            log.severe("Failed to save to database - " + e.getMessage());
        }
    }

    public static String getUrl(String key) {
        var sql = "SELECT url FROM urls WHERE id = ?";
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {

            statement.setString(1, key);
            var result = statement.executeQuery();
            if (result.next())
                return result.getString("url");
            else return null;

        } catch (SQLException e) {
            log.severe("Failed to retrieve from database - " + e.getMessage());
            return null;
        }
    }

    private static String getEnvOrElse(String key, String defaultValue) {
        String value = System.getenv(key);
        return value != null ? value : defaultValue;
    }

}
