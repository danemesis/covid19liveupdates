CALL cd ..
CALL heroku container:login
CALL heroku container:push web --app=demo-covid19livebot
CALL heroku container:release web --app=demo-covid19livebot
CALL heroku open --app=demo-covid19livebot
