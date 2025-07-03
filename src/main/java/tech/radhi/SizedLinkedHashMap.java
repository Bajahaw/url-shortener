package tech.radhi;

import java.util.LinkedHashMap;
import java.util.Map;

public class SizedLinkedHashMap<K, V> extends LinkedHashMap<K, V> {

    private final int MAX_SIZE;

    /**
     * Simple implementation for a key-value cache map
     * utilizing java built-in LinkedHashMap. Works normally
     * like a regular map until it reaches maxSize, then
     * it automatically starts deleting from the least
     * accessed values saving up memory.
     *
     * @param maxSize number of values the cache can take before
     *               starting deleting old values.
     */
    public SizedLinkedHashMap(int maxSize) {
        super(maxSize,  0.75f, true);
        this.MAX_SIZE = maxSize;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > MAX_SIZE;
    }

}
