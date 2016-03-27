angular.module('app.services', [])

.factory('$localStorage', ['$window', function($window) {

  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };

}])

.service('agenciaStore', function(database, $q) {

	var _data = [];

	var toRad = function(num) {
		return num * Math.PI / 180;
	};

	var haversine = function(start, end, options) {
		var km    = 6371;
		var mile  = 3960;
		options   = options || {};

		var R = options.unit === 'mile' ?
		  mile :
		  km;

		var dLat = toRad(end.latitude - start.latitude);
		var dLon = toRad(end.longitude - start.longitude);
		var lat1 = toRad(start.latitude);
		var lat2 = toRad(end.latitude);

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		if (options.threshold) {
		  return options.threshold > (R * c);
		} else {
		  return R * c;
		}
  	};

	var _load = function(position, distance) {
		var deferred = $q.defer();

		/*
		Doc structure:
		{
			_id: 1,
			_rev: 123,
			latitude: -19, 
			longitude: -43, 
			bank: 'Itaú',
			agency: '123-4',
			icon: '/img/icons/symbol_dollar.png',
			notes: [
				2,
				5,
				10,
				20,
				50,
				100
			]
		}
		*/
		database.local.allDocs({
			include_docs: true,
		}).then(function(result) {
			result.rows.forEach(function(agencia) {
				var dist = haversine(position, agencia, { unit: 'km' });
				if (dist <= distance) {
					_data.push(agencia);
				}
			});
			deferred.resolve(data);
		}).catch(function(err) {
			deferred.reject(err);
		});

		return deferred.promise;
	};

	return {
		load: _load,
		data: _data
	}
})

.service('database', function() {

	var localDb = new PouchDB('lowmoney');
	var remoteDb = new PouchDB('http://server1.desenvolve4web.com:5984/lowmoney');

	return {
		local: localDb,
		remote: remoteDb
	};

})

.factory('databaseListener', function($rootScope, database) {
	database.local.changes({
		continuous: true,
		onChange: function(change) {
		 	if (!change.deleted) {
				// for add or update
		   		$rootScope.$apply(function() {
		     		database.local.get(change.id, function(err, doc) {
		       			$rootScope.$apply(function() {
		         			if (err) {
		         				console.log(err);
		         				$rootScope.$broadcast('databaseErr', err);
		         			}
		         			$rootScope.$broadcast('add', doc);
		       			})
		     		});
		   		})
		 	} else {
		 		// for delete
		   		$rootScope.$apply(function() {
		     		$rootScope.$broadcast('delete', change.id);
	   			});
	 		}
		}
	});

	return true;
});
