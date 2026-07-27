-- Runs once, only when the data volume is first created (per the official postgres image's
-- entrypoint convention). appevents_dev already exists via POSTGRES_DB; this adds the second
-- database the integration test suite connects to (see AppEventsWebApplicationFactory).
CREATE DATABASE appevents_test;
