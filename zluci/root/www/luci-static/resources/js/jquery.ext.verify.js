(function(root, undefined) {

	var VerifyImplication = {
		"string": {
			method: function(val, regexp){
				//alert(val);
				return true;
			},
			message: ""
		},
		"num": {
			method: function(val, from, to){
				var re = /^-?[1-9]\d*$/;
				if (!val.match(re)) {
					return false;
				}
				if (from && to) {
					return (parseInt(val) >= parseInt(from) && parseInt(val) <= parseInt(to));
				}
				return true;
			},
			message: "非法数字格式"
		},
	}

	function getVerifyObject(key){
		var obj = VerifyImplication[key];
		if (typeof(obj) == "object" && obj.method) {
			return obj;
		} else {
			return null;
		}
	}

	function getVerfiyPars(doc) {
		var verify = doc.attr('verify');
		if (doc.is(":disabled")) return null;
		if (typeof(verify) != "string") {
			return null;
		}
		return verify.split(' ');
	}

	var verification = function(doc) {
		var res = true;
		if (!doc) doc = "body";

		$('input,textarea', doc).each(function() {
			var val,
				key,
				pars,
				obj;

			pars = getVerfiyPars($(this));
			if (!pars || pars.length < 1) {
				return true;
			}

			val = this.val();
			key = pars[0];
			obj = getVerifyObject(key);

			if (obj && obj.method) {
				pars[0] = val;
				res = obj.method.apply(this, pars);
				if (res != true) {
					$(this).addClass('invalid');
					alert(obj.message);
					return false;
				} else {
					$(this).removeClass('invalid');
				}
			}
		});

		return res;
	}

	var verifyEventsInit = function(doc) {
		if (!doc) doc = "body";
		$('input,textarea', doc).each(function() {
			var val,
				key,
				pars,
				obj;

			pars = getVerfiyPars($(this));
			if (!pars || pars.length < 1) {
				return true;
			}

			val = this.val();
			key = pars[0];
			obj = getVerifyObject(key);
			
			if (obj && obj.method) {
				$(this).on('blur', function() {
					pars[0] = val;
					var res = obj.method.apply(this, pars);
					if (res != true && pars != '') {
						$(this).addClass('invalid');
					} else {
						$(this).removeClass('invalid');
					}
				});
			}
		});
	}

	root.verification = verification;			//直接显示调用
	root.verifyEventsInit = verifyEventsInit;	//事件绑定触发方式调用
})(this);