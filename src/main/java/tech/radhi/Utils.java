package tech.radhi;

import java.security.SecureRandom;

public class Utils {

    private static final SecureRandom random = new SecureRandom();
    private static final char[] alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

    /**
     * Helper method for generating random and unique keys
     *
     * @param len The length of the required key
     * @return the generated key as String
     */
    public static String generateKey(int len) {
        StringBuilder key = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int rnd = random.nextInt(alphabets.length);
            char chr = alphabets[rnd];
            key.append(chr);
        }
        return key.toString();
    }
    
    /**
     * Helper method to get environment variable
     * or return default value
     *
     * @param key The name of the environment variable
     * @param defaultValue The default value to return if the environment variable is not set
     * @return the value of the environment variable or the default value
     */
    public static String getEnvOrElse(String key, String defaultValue) {
        String value = System.getenv(key);
        return value != null ? value : defaultValue;
    }
}
