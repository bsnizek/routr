# informal-routr


`informal-routr` is a Flask and leaflet based webapp that records and stores subject reported routes.

Called with a parameter handed over by a questionnaire app, it saves routes in a geospatially enabled database. 

## Installation

For delevoment, you need to have `Python`, `nodeJS`, `npm`, `Grunt`, `Bower` and `Git` installed on the system before you proceed:

  	$ git clone <repo>

  	$ cd <repo>

  	$ virtualenv informal-routr

  	$ source venv/bin/activate

  	$ pip install -r requirements.txt

  	$ npm install
  	
  	$ npm install -g bower

  	$ bower install
  	
  	$ bower install grunt

In production, informal-routr needs a running `PostgreSQL` with the `PostGIS` extension installed. 