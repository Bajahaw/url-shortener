package tech.radhi;

import java.io.IOException;
import java.util.logging.Logger;

public class Main {

    private final static Logger log = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) throws IOException {

        LoggingSetup.configure();
        DataSource.connect();
        Controller.start();

        log.info("Application Started .. ready to receive requests");

    }
}