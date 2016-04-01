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
})

.service('BancosBrasil', function() {
  var data = [
    { id: "ABC Brasil S.A.", nome: "ABC Brasil S.A." },
    { id: "ABN AMRO S.A.", nome: "ABN AMRO S.A." },
    { id: "Alfa S.A.", nome: "Alfa S.A." },
    { id: "Alvorada S.A.", nome: "Alvorada S.A." },
    { id: "Andbank (Brasil) S.A.", nome: "Andbank (Brasil) S.A." },
    { id: "BANDEPE S.A.", nome: "BANDEPE S.A." },
    { id: "Barclays S.A.", nome: "Barclays S.A." },
    { id: "BBM S.A.", nome: "BBM S.A." },
    { id: "BM&FBOVESPA", nome: "BM&FBOVESPA" },
    { id: "BMG S.A.", nome: "BMG S.A." },
    { id: "BNP Paribas Brasil S.A.", nome: "BNP Paribas Brasil S.A." },
    { id: "Boavista Interatlântico S.A.", nome: "Boavista Interatlântico S.A." },
    { id: "Bonsucesso Consignado S.A.", nome: "Bonsucesso Consignado S.A." },
    { id: "Bonsucesso S.A.", nome: "Bonsucesso S.A." },
    { id: "Bradescard S.A.", nome: "Bradescard S.A." },
    { id: "Bradesco BBI S.A.", nome: "Bradesco BBI S.A." },
    { id: "Bradesco Cartões S.A.", nome: "Bradesco Cartões S.A." },
    { id: "Bradesco Financiamentos S.A.", nome: "Bradesco Financiamentos S.A." },
    { id: "Bradesco S.A.", nome: "Bradesco S.A." },
    { id: "BTG Pactual S.A.", nome: "BTG Pactual S.A." },
    { id: "Cacique S.A.", nome: "Cacique S.A." },
    { id: "Caixa Geral - Brasil S.A.", nome: "Caixa Geral - Brasil S.A." },
    { id: "Cargill S.A.", nome: "Cargill S.A." },
    { id: "Caterpillar S.A.", nome: "Caterpillar S.A." },
    { id: "CBSS S.A.", nome: "CBSS S.A." },
    { id: "Cetelem S.A.", nome: "Cetelem S.A." },
    { id: "Cifra S.A.", nome: "Cifra S.A." },
    { id: "Citibank S.A.", nome: "Citibank S.A." },
    { id: "CNH Industrial Capital S.A.", nome: "CNH Industrial Capital S.A." },
    { id: "Confidence de Câmbio S.A.", nome: "Confidence de Câmbio S.A." },
    { id: "Cooperativo do Brasil S.A. - BANCOOB", nome: "Cooperativo do Brasil S.A. - BANCOOB" },
    { id: "Cooperativo Sicredi S.A.", nome: "Cooperativo Sicredi S.A." },
    { id: "Credit Agricole Brasil S.A.", nome: "Credit Agricole Brasil S.A." },
    { id: "Credit Suisse (Brasil) S.A.", nome: "Credit Suisse (Brasil) S.A." },
    { id: "CSF S.A.", nome: "CSF S.A." },
    { id: "Amazônia S.A.", nome: "Amazônia S.A." },
    { id: "China Brasil S.A.", nome: "China Brasil S.A." },
    { id: "Daycoval S.A.", nome: "Daycoval S.A." },
    { id: "Lage Landen Brasil S.A.", nome: "Lage Landen Brasil S.A." },
    { id: "Tokyo-Mitsubishi UFJ Brasil S.A.", nome: "Tokyo-Mitsubishi UFJ Brasil S.A." },
    { id: "Banco do Brasil S.A.", nome: "Banco do Brasil S.A." },
    { id: "Banco do Estado de Sergipe S.A.", nome: "Banco do Estado de Sergipe S.A." },
    { id: "Banco do Estado do Pará S.A.", nome: "Banco do Estado do Pará S.A." },
    { id: "Banco do Estado do Rio Grande do Sul S.A.", nome: "Banco do Estado do Rio Grande do Sul S.A." },
    { id: "Banco do Nordeste do Brasil S.A.", nome: "Banco do Nordeste do Brasil S.A." },
    { id: "Fator S.A.", nome: "Fator S.A." },
    { id: "Fibra S.A.", nome: "Fibra S.A." },
    { id: "Ficsa S.A.", nome: "Ficsa S.A." },
    { id: "Fidis S.A.", nome: "Fidis S.A." },
    { id: "Ford S.A.", nome: "Ford S.A." },
    { id: "GMAC S.A.", nome: "GMAC S.A." },
    { id: "Guanabara S.A.", nome: "Guanabara S.A." },
    { id: "Honda S.A.", nome: "Honda S.A." },
    { id: "IBM S.A.", nome: "IBM S.A." },
    { id: "INBURSA de Investimentos S.A.", nome: "INBURSA de Investimentos S.A." },
    { id: "Industrial do Brasil S.A.", nome: "Industrial do Brasil S.A." },
    { id: "Indusval S.A.", nome: "Indusval S.A." },
    { id: "Investcred Unibanco S.A.", nome: "Investcred Unibanco S.A." },
    { id: "Itaú BBA S.A.", nome: "Itaú BBA S.A." },
    { id: "Itaú BMG Consignado S.A.", nome: "Itaú BMG Consignado S.A." },
    { id: "Itaú Veículos S.A.", nome: "Itaú Veículos S.A." },
    { id: "ItaúBank S.A", nome: "ItaúBank S.A" },
    { id: "Itaucard S.A.", nome: "Itaucard S.A." },
    { id: "Itaucard S.A.", nome: "Itaucard S.A." },
    { id: "J. Safra S.A.", nome: "J. Safra S.A." },
    { id: "John Deere S.A.", nome: "John Deere S.A." },
    { id: "Luso Brasileiro S.A.", nome: "Luso Brasileiro S.A." },
    { id: "Mercantil do Brasil S.A.", nome: "Mercantil do Brasil S.A." },
    { id: "Mizuho do Brasil S.A.", nome: "Mizuho do Brasil S.A." },
    { id: "Modal S.A.", nome: "Modal S.A." },
    { id: "Original S.A.", nome: "Original S.A." },
    { id: "PAN S.A.", nome: "PAN S.A." },
    { id: "Paulista S.A.", nome: "Paulista S.A." },
    { id: "Petra S.A.", nome: "Petra S.A." },
    { id: "Pine S.A.", nome: "Pine S.A." },
    { id: "PSA Finance Brasil S.A.", nome: "PSA Finance Brasil S.A." },
    { id: "Rabobank International Brasil S.A.", nome: "Rabobank International Brasil S.A." },
    { id: "Rendimento S.A.", nome: "Rendimento S.A." },
    { id: "Rodobens S.A.", nome: "Rodobens S.A." },
    { id: "Safra S.A.", nome: "Safra S.A." },
    { id: "Santander (Brasil) S.A.", nome: "Santander (Brasil) S.A." },
    { id: "Société Générale Brasil S.A.", nome: "Société Générale Brasil S.A." },
    { id: "Sumitomo Mitsui Brasileiro S.A.", nome: "Sumitomo Mitsui Brasileiro S.A." },
    { id: "Topázio S.A.", nome: "Topázio S.A." },
    { id: "Toyota do Brasil S.A.", nome: "Toyota do Brasil S.A." },
    { id: "Triângulo S.A.", nome: "Triângulo S.A." },
    { id: "Volkswagen S.A.", nome: "Volkswagen S.A." },
    { id: "Volvo (Brasil) S.A.", nome: "Volvo (Brasil) S.A." },
    { id: "Votorantim S.A.", nome: "Votorantim S.A." },
    { id: "VR S.A.", nome: "VR S.A." },
    { id: "Western Union do Brasil S.A.", nome: "Western Union do Brasil S.A." },
    { id: "Yamaha Motor S.A.", nome: "Yamaha Motor S.A." },
    { id: "BANESTES S.A. Banco do Estado do Espírito Santo", nome: "BANESTES S.A. Banco do Estado do Espírito Santo" },
    { id: "Banif-Banco Internacional do Funchal (Brasil)S.A.", nome: "Banif-Banco Internacional do Funchal (Brasil)S.A." },
    { id: "Bank of America Merrill Lynch Banco Múltiplo S.A.", nome: "Bank of America Merrill Lynch Banco Múltiplo S.A." },
    { id: "BBN Banco Brasileiro de Negócios S.A.", nome: "BBN Banco Brasileiro de Negócios S.A." },
    { id: "BCV - Banco de Crédito e Varejo S.A.", nome: "BCV - Banco de Crédito e Varejo S.A." },
    { id: "BEXS Banco de Câmbio S.A.", nome: "BEXS Banco de Câmbio S.A." },
    { id: "BNY Mellon Banco S.A.", nome: "BNY Mellon Banco S.A." },
    { id: "BPN Brasil Banco Múltiplo S.A.", nome: "BPN Brasil Banco Múltiplo S.A." },
    { id: "Brasil Plural S.A. - Banco Múltiplo", nome: "Brasil Plural S.A. - Banco Múltiplo" },
    { id: "BRB - Banco de Brasília S.A.", nome: "BRB - Banco de Brasília S.A." },
    { id: "Caixa Econômica Federal", nome: "Caixa Econômica Federal" },
    { id: "China Construction Bank (Brasil) Banco Múltiplo S.A.", nome: "China Construction Bank (Brasil) Banco Múltiplo S.A." },
    { id: "Citibank N.A.", nome: "Citibank N.A." },
    { id: "Deutsche Bank S.A.", nome: "Deutsche Bank S.A." },
    { id: "Goldman Sachs do Brasil Banco Múltiplo S.A.", nome: "Goldman Sachs do Brasil Banco Múltiplo S.A." },
    { id: "Haitong Banco de Investimento do Brasil S.A.", nome: "Haitong Banco de Investimento do Brasil S.A." },
    { id: "Hipercard Banco Múltiplo S.A.", nome: "Hipercard Banco Múltiplo S.A." },
    { id: "HSBC Bank Brasil S.A.", nome: "HSBC Bank Brasil S.A." },
    { id: "ING Bank N.V.", nome: "ING Bank N.V." },
    { id: "Itaú Unibanco Holding S.A.", nome: "Itaú Unibanco Holding S.A." },
    { id: "Itaú Unibanco S.A.", nome: "Itaú Unibanco S.A." },
    { id: "JPMorgan Chase Bank", nome: "JPMorgan Chase Bank" },
    { id: "MS Bank S.A.", nome: "MS Bank S.A." },
    { id: "Paraná Banco S.A.", nome: "Paraná Banco S.A." },
    { id: "Scotiabank Brasil S.A.", nome: "Scotiabank Brasil S.A." },
    { id: "Standard Chartered Bank (Brasil) S/A–Bco Invest.", nome: "Standard Chartered Bank (Brasil) S/A–Bco Invest." },
    { id: "UBS Brasil Banco de Investimento S.A.", nome: "UBS Brasil Banco de Investimento S.A." },
  ];

  return data;

});
