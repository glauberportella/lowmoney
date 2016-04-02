
angular.module('app.services', [])

.factory('$localStorage', function($window) {

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

})

.service('agenciaStore', function(database, $q, $rootScope, $localStorage, defaultDistance) {

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

    if (!position)
      return;

    distance = distance || defaultDistance;

		/*
		Doc structure:
		{
			_id: "<bancoId><latitude><longitude>",
			_rev: 123,
			latitude: -19,
			longitude: -43,
			banco: { id: '341', nome: 'Itaú' },
			agenciaId: '123-4',
			icone: '/img/bancos/341.png',
      marker: '/img/markers/341.png',
			nota2: true,
      nota5: true,
      nota10: false,
      nota20: true,
      nota50: false,
      nota100: true
		}
		*/
		database.local.allDocs({
			include_docs: true,
		}).then(function(result) {
      _data.length = 0;
      _data = [];
			result.rows.forEach(function(res) {
				var dist = haversine(position, res.doc, { unit: 'km' });
				if (dist <= distance) {
					_data.push(res.doc);
				}
			});
      $rootScope.$broadcast('agencia:loaded', _data);
			deferred.resolve(_data);
		}).catch(function(err) {
			deferred.reject(err);
		});

		return deferred.promise;
	};

  /**
   * Add or update a agencia in db
   * @param {Object} agencia
   * @return promise
   */
  var _put = function(agencia) {
    var deferred = $q.defer();

    if (agencia._id == undefined) {
      agencia._id = [agencia.banco.id, agencia.latitude, agencia.longitude].join('');
    }

    agencia.icone = '/img/bancos/'+agencia.banco.id+'.png';
    agencia.marker = '/img/markers/'+agencia.banco.id+'.png';

    if (agencia._rev !== undefined) {
      database.local.put(agencia, agencia._id, agencia._rev).then(function(response) {
        deferred.resolve(response);
      }).catch(function(err) {
        deferred.reject(err);
      });
    } else {
      database.local.put(agencia).then(function(response) {
        deferred.resolve(response);
      }).catch(function(err) {
        deferred.reject(err);
      });
    }

    // reload data
    var pos = $localStorage.getObject('position');
    _load(pos, defaultDistance);

    return deferred.promise;
  };

	return {
		load: _load,
    put: _put,
		data: _data
	}
})

.service('database', function() {

  var localDb = new PouchDB('lowmoney');
  var remoteDb = new PouchDB('http://server1.desenvolve4web.com:5984/lowmoney');


  // Design documents
  /*var ddoc = {
    _id: '_design/agencia',
    views: {
      agencia: {
        map: function mapFun(doc) {
          if (doc.title) {
            emit(doc.title);
          }
        }.toString()
      }
    }
  };*/

  /**
   * Initialize database design documents for PouchDB
   * @return {void}
   */
  var _init = function() {

    /*localDb.put(ddoc).catch(function (err) {
      if (err.status !== 409) {
        throw err;
      }
      // ignore if doc already exists
    });*/

    // TODO
  };

	return {
    init: _init,
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
		     		database.local.get(change._id, function(err, doc) {
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
		     		$rootScope.$broadcast('delete', change._id);
	   			});
	 		}
		}
	});

	return true;
})

.service('BancosBrasil', function() {
  var data = [
    { id: '001', nome: 'Banco do Brasil' },
    { id: '041', nome: 'Banrisul' },
    { id: '004', nome: 'BNB' },
    { id: '070', nome: 'BRB' },
    { id: '237', nome: 'Bradesco' },
    { id: '104', nome: 'Caixa Econômica Federal' },
    { id: '745', nome: 'Citibank' },
    { id: '399', nome: 'HSBC Bank' },
    { id: '341', nome: 'Itaú Unibanco' },
    { id: '033', nome: 'Santander' }
  ];

  return data;

})

.factory('Geocoder', function($q) {

  var _geocode = function(request) {
    var deferred = $q.defer();

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode(request, function(result, status) {
      var success = false,
          error = {
            message: 'Erro desconhecido'
          };

      switch (status) {
        case "ZERO_RESULTS":
          error.message = 'Verifique o endereço, nenhuma localização encontrada.';
          break;
        case "OVER_QUERY_LIMIT":
          error.message = 'Cota excedida no webservice de Geolocalização. Tente novamente mais tarde.';
          break;
        case "REQUEST_DENIED":
          error.message = 'Requisição negada.';
          break;
        case "INVALID_REQUEST":
          error.message = 'Requisição inválida, informe um endereço.';
          break;
        case "UNKNOWN_ERROR":
          error.message = 'Erro interno no servidor de Gelocalização. Tente novamente após alguns minutos.';
          break;
        default:
          success = true;
      }

      if (success) {
        deferred.resolve(result);
      } else {
        deferred.reject(error);
      }

    });

    return deferred.promise;
  };

  var _streetAddress = function(result) {
    return result.formatted_address;
  };

  var _extractDistrictFromStreetAddressComponent = function(components) {
    var district = null;

    angular.forEach(components, function(component) {
      var political = false;
      var sublocality = false;
      var sublocalityLevel1 = false;
      if (component.types) {
        angular.forEach(component.types, function(type) {
          if (!political)
            political = type == 'political';
          if (!sublocality)
            sublocality = type == 'sublocality';
          if (!sublocalityLevel1)
            sublocalityLevel1 = type == 'sublocality_level_1';
        });
        if (political && sublocality && sublocalityLevel1) {
          district = component.long_name;
        }
      }
    });

    return district;
  };

  var _extractCityFromStreetAddressComponent = function(components) {
    var city = null;

    angular.forEach(components, function(component) {
      var political = false;
      var locality = false;
      if (component.types) {
        angular.forEach(component.types, function(type) {
          if (!political)
            political = type == 'political';
          if (!locality)
            locality = type == 'locality';
        });
        if (political && locality) {
          city = component.long_name;
        }
      }
    });

    return city;
  };

  var _extractStateFromStreetAddressComponent = function(components) {
    var state = null;

    angular.forEach(components, function(component) {
      var political = false;
      var administrativeAreaLevel1 = false;
      if (component.types) {
        angular.forEach(component.types, function(type) {
          if (!political)
            political = type == 'political';
          if (!administrativeAreaLevel1)
            administrativeAreaLevel1 = type == 'administrative_area_level_1';
        });
        if (political && administrativeAreaLevel1) {
          state = component.short_name;
        }
      }
    });

    return state;
  };

  return function() {
    return {
      geocode:          _geocode,
      streetAddress:    _streetAddress,
      extractDistrict:  _extractDistrictFromStreetAddressComponent,
      extractCity:      _extractCityFromStreetAddressComponent,
      extractState:     _extractStateFromStreetAddressComponent
    };
  };

});
