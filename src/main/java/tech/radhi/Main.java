package tech.radhi;

import java.io.IOException;
import java.util.logging.Logger;

public class Main {

    private final static Logger log = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) throws IOException {

        LoggingSetup.configure();
        Controller.start();
        // todo: db logic

        log.info("Application Started .. ready to receive requests");

    }
}