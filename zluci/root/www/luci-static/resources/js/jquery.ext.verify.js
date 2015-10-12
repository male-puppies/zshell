(function(root, undefined) {

	var VerifyImplication = {
		"ip": {
			method: function(val) {
				var reg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				return (reg.test(val)) ? true : false;
			},
			message: "非法IP格式。"
		},
		"ips":{
			method: function(val) {
				var ip_reg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				var ips_reg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
				val = val.trim();
				var arr = val.split('\n');
				for (var k = 0; k < arr.length; k++) {
					if (!(ip_reg.test(arr[k]) || ips_reg.test(arr[k]))) {
						return false;
					}
					
					if (ips_reg.test(arr[k])) {
						var ips = arr[k].split('-');
						var arr1 = ips[0].split('.');
						var arr2 = ips[1].split('.');
						for (var i = 0; i < arr1.length; i++) {
							if (parseInt(arr1[i]) > parseInt(arr2[i])) {
								return false;
							} else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
								break;
							}
						}
					}
				}
				return true;
			},
			message: "非法IP格式。"	
		},
		"mac": {
			method: function(val) {
				var reg = /^([0-9a-fA-F]{2}(:)){5}[0-9a-fA-F]{2}$/;
				return (reg.test(val)) ? true : false;
			},
			message: "非法MAC格式。"
		},
		"macs": {
			method: function(val) {
				var reg = /^([0-9a-fA-F]{2}(:)){5}[0-9a-fA-F]{2}$/;
				
				val = val.trim();
				var arr = val.split('\n');
				for (var k = 0; k < arr.length; k++) {
					if (!reg.test(arr[k])) {
						return false;
					}
				}
				return true;
			},
			message: "非法MAC格式。"
		},
		"num": {
			method: function(val, from, to){
				var reg = /^-?[0-9]\d*$/;
				if (!reg.test(val)) return false;
				if (from && to) return (parseInt(val) >= parseInt(from) && parseInt(val) <= parseInt(to));
				return true;
			},
			message: "非法数字格式。"
		},
		"notspace": {
			method: function(val) {
				return $.trim(val) != "" ? true : false;
			},
			message: "非法格式。不能为空。"
		},
		"name": {
			method: function(val) {
				var reg = /^[a-zA-Z0-9- _.\u4e00-\u9fa5]{4,32}$/;
				return (reg.test(val)) ? true : false;
			},
			message:"非法格式。只能包含数字、字母、‘-’、‘.’ 和下划线。长度范围4~16。"				
		},
		"pwd": {
			method: function(val){
				var re = /^[0-9a-zA-Z_]{4,16}$/i;
				return val.match(re)!=null;
			},
			message: "非法格式。只能包含数字、字母和下划线。长度范围4~16。"
		},
		"ssid": {
			method: function(val){
				var len = 0;
				for (var i=0; i<val.length; i++) {
					var c = val.charCodeAt(i);
					//单字节加1
					if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
						len++;
					}
					else {
						len += 3;
					}
				}
				var reg = /^[a-zA-Z0-9- _.\u4e00-\u9fa5]{1,32}$/;
				var mark = (reg.test(val)) ? true : false;
				if (len <= 32 && mark) {
					return true;
				} else {
					return false;
				}
			},
			message: "非法格式。输入字符串长度小于32个字符,不超过十个中文。"				
		},
		"wpassword": {
			method: function(val) {
				var reg = /^[a-z|0-9|A-Z]{8,32}$/;
				return (reg.test(val)) ? true : false;
			},
			message: "非法格式。输入数字/字母, 长度: 8~32个字符。"
		}
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
		if (doc.is(":disabled")) {
			doc.removeClass('invalid');
			return null;
		}
		if (typeof(verify) != "string") {
			return null;
		}
		return verify.split(' ');
	}

	var verification = function(doc) {
		var res = true;
		if (!doc) doc = "body";

		$('input,textarea', doc).each(function() {
			var key,
				pars,
				obj;

			pars = getVerfiyPars($(this));
			if (!pars || pars.length < 1) {
				return true;
			}

			key = pars[0];
			obj = getVerifyObject(key);

			if (obj && obj.method) {
				pars[0] = $(this).val();
				res = obj.method.apply(this, pars);
				if (res != true) {
					var tip = $(this).closest(".cbi-value").find("label.cbi-value-title").html() || "";
					$(this).addClass('invalid');
					alert(tip + " " + obj.message);
					return false;
				} else {
					$(this).removeClass('invalid');
				}
			}
		});

		return res;
	}

	var verifyEventsInit = function(doc) {
		var res = true;
		if (!doc) doc = "body";
		$('input,textarea', doc).each(function() {
			var key,
				pars,
				obj;

			pars = getVerfiyPars($(this));
			if (!pars || pars.length < 1) {
				return true;
			}

			key = pars[0];
			obj = getVerifyObject(key);
			
			if (obj && obj.method) {
				$(this).on('blur', function() {
					pars[0] = $(this).val();
					res = obj.method.apply(this, pars);
					if (res != true) {
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