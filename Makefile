all:
	DISPLAY=:0 sudo google-chrome --pack-extension=Source --user-data-dir=/tmp/foooo
	sudo chown hank:hank Source.crx
