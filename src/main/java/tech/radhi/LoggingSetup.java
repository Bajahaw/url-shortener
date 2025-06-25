package tech.radhi;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.*;

/**
 * Java logging was not configured very well by default.
 * This class sets up a custom logging configuration
 * that outputs logs to the console with colors
 * and timestamps.
 */
public class LoggingSetup {

    public static void configure() {
        Logger root = Logger.getLogger("");
        for (Handler h : root.getHandlers()) {
            root.removeHandler(h);
        }

        Handler handler = new StdoutHandler();
        root.addHandler(handler);
    }

}

/**  
 * handler had to reimplemented because setOutputStream(System.out)
 * is package-private
 */
class StdoutHandler extends ConsoleHandler {
    public StdoutHandler() {
        super();
        setOutputStream(System.out);
        setFormatter(new ColorFormatter());
    }
}

class ColorFormatter extends Formatter {
    private static final String RESET = "\u001B[0m";
    private static final String RED   = "\u001B[31m";
    private static final String YELLOW= "\u001B[33m";
    private static final String CYAN  = "\u001B[36m";
    private static final String MAGENTA = "\u001B[35m";

    private final SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * This overriding was necessary to reformat the log messages with
     * a timestamp, log level, logger name, and the actual message.
     * kind of what spring boot does by default.
     * 
     * @param r the log record to format
     * @return the formatted log message, e.g.:
     * <pre>
     * 2023-10-01 12:34:56 INFO tech.radhi.LoggingSetup - This is a log message
     * 
     */
    @Override
    public String format(LogRecord r) {
        String timestamp = df.format(new Date(r.getMillis()));
        String levelStr  = r.getLevel().getName();
        String coloredLvl = String.format("%s%s%s",
                switch (levelStr) {
                    case "SEVERE"  -> RED;
                    case "WARNING" -> YELLOW;
                    default        -> CYAN;
                },
                levelStr,
                RESET
        );
        String loggerName = r.getLoggerName();
        String logger = String.format("%s%s%s", MAGENTA, loggerName, RESET);
        String message    = formatMessage(r);

        // timestamp, level, logger, then dash+message
        return String.format(
                "%s\t%s\t%s\t: %s%n",
                timestamp,
                coloredLvl,
                logger,
                message
        );
    }
}