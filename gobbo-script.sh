#!/bin/bash


case "$1" in
	start)
	    nohup node gobbo.js > gobbo.log &
		;;

	stop)
		ps -ef | grep gobbo | awk '{print "kill -9 "$2}' | sh
		;;
	pull)
	    git pull gobbot-gitlab master
	    ;;
	restartpull)
	    ps -ef | grep gobbo | awk '{print "kill -9 "$2}' | sh ; git pull gobbot-gitlab master ; nohup node gobbo.js > gobbo.log &
	    ;;
	*)
		echo "Usage: $0 {start|stop|restartpull}"
		exit 1
esac
