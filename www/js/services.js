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

.service('agenciaStore', function(database) {
	var _load = function(position, distance) {
		return [
			{
				_id: 1,
				_rev: 123,
				latitude: -19, 
				longitude: -43, 
				bank: 'Itaú',
				ag: '123-4',
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
		];
	};

	return {
		load: _load
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
