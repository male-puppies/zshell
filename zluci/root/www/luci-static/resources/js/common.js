(function(root, undefined) {
	
	function cgicall() {
		var url = "../cgicall",
			obj = {},
			argc = arguments.length,
			callback = function(d, x, s) {};

		if (typeof(arguments[argc - 1]) === "function") {
			argc = argc - 1;
			callback = arguments[argc];
		}

		switch(argc){
			case 1:
				if (typeof(arguments[0]) === "string") {
					obj["cmd"] = arguments[0];
				} else {
					console.log("error cgicall...")
				}
				break;
			case 2:
				obj["cmd"] = arguments[0];
				obj["data"] = arguments[1];
				break;
			default:
				console.log("error cgicall...")
				break;
		}

		$.post(url, obj, callback, "json");
	}
	
	function jsonTraversal(obj, func, prefix) {
		var oset = obj;
		for (var k in obj) {
			if (typeof(obj[k]) == 'object') {
				oset[k] = recurseTravSubNode(obj[k], k, func, prefix);
			} else {
				var fp = k;
				if (typeof(prefix) == 'string') {
					fp = prefix + '__' + k;
				};
				oset[k] = func(fp, obj[k]);
			}
		}
		return oset;
	}
	
	//遍历所有节点
	function recurseTravSubNode(o, parent, func, prefix) {
		var oset = o;
		for (var k in o) {
			var fp = parent + '__' + k;
			if (typeof(o[k]) == 'object') {
				//还有子节点.
				oset[k] = recurseTravSubNode(o[k], fp, func, prefix);
			} else {
				//最后一级
				if (typeof(prefix) == 'string') {
					fp = prefix + '__' + fp;
				};
				oset[k] = func(fp, o[k]);
			}
		}
		return oset;
	}
	
	
	/*
		********
		需要特殊处理的控件:checkbox, radio
		不需要特殊处理的:text, texterea, select,
		*********
	*/
	function jsTravSet(fp, v) {
		var doc = getControlByIdMisc(fp),
			type = doc.attr('type');
		
		switch (type) {
			case "checkbox":
				if (typeof(v) == 'boolean') {
					doc.attr('checked', v);
				} else if (typeof(v) == 'string') {
					doc.attr('checked', (v == doc.val() ? true : false));
				}
				break;

			case "radio":
				$('input:radio[name="'+ fp +'"]').each(function(index, element) {
					if ($(element).val() == v) {
						$(element).attr('checked', true);
					} else {
						$(element).attr('checked', false);
					}
				});
				break;

			default:
				doc.val(v);
				break;
		}

		return v;
	}

	function jsTravGet(fp, v){
		var nv,
			doc = getControlByIdMisc(fp),
			type = doc.attr('type');

		switch (type) {
			case 'checkbox':
				if (typeof(v) == 'boolean') {
					nv = (doc.is(':checked') ? true : false);
				} else if (typeof(v) == 'string') {
					nv = (doc.is(':checked') ? doc.val() : "0");
				};
				break;

			case 'radio':
				nv = $('input:radio[name="'+ fp +'"]:checked').val();
				break;

			default:
				nv = doc.val();
				break;
		}

		nv = (typeof(nv) == 'undefined' ? v : nv);

		if (typeof(v) == 'number') {
			nv = parseInt(nv);
		};
		return nv;
	}


	function getControlByIdMisc(id){
		//优先尝试input类型,其次select,再次ID.
		var id = id.replace(/\//g, '-'),
			id = id.replace(/\:/g, '_');
			res = $('input#' + id);

		if (res.length < 1) {
			res = $('select#' + id);
		}
		if (res.length < 1) {
			res = $('#' + id);
		};
		return res;
	}

	function ObjCountLength(o) {
		var t = typeof o;
		if (t == 'string') {
			return o.length;
		} else if (t == 'object') {
			var n = 0;
			for (var i in o) {
				n++;
			}
			return n;
		}
		return false;
	}
	
	function ObjToArray(o) {
        var aar = [];
        var i = 0;
        for (key in o) {
            if (typeof(o[key]) == 'object') {
                if (!o[key].Name) {
                    o[key].Name = key;
                    o[key].aaIndex = i++;
                }
            } else {
                var temp = o[key];
                o[key] = {};
                o[key].Name = key;
                o[key].Value = temp;
                o[key].aaIndex = i++;
            }
            aar.push(o[key]);
        }
        return aar;
    }

	function ObjClone(obj) {
		var o;
		if (typeof obj == "object") {
			if (obj === null) {
				o = null;
			} else {
				if (obj instanceof Array) {
					o = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						o.push(ObjClone(obj[i]));
					}
				} else {
					o = {};
					for (var j in obj) {
						o[j] = ObjClone(obj[j]);
					}
				}
			}
		} else {
			o = obj;
		}
		return o;
	}
	
	
	function dtReloadData(oDt, aaData, keepPage, oFun) {
		if (ObjCountLength(aaData) == 0) {
			oDt.fnClearTable(true);
			return;
		}
        var oSetting = oDt.fnSettings();
        var page = oSetting._iDisplayStart / oSetting._iDisplayLength;
        oDt.fnClearTable(true);
        oDt.fnAddData(aaData, true);
		//过滤
		if (oFun && typeof oFun == 'function') {
			oFun();
		}
        if (keepPage != 'undefined' && keepPage) {
            oDt.fnPageChange(page);
        };
    }
	
	function dtHideColumn(oDt, hd) {
		var that = oDt.selector;
		var node = oDt.fnGetNodes();
		var last = [];
		
		for (var i in hd) {
			$(that).find('tr:eq(0) td').each(function(index, element) {
				if($(element).attr('colid') == hd[i]) {
					last.push(index);
				};
			});
		}
		
		$(that).find('tr:eq(0) td').css('display', 'table-cell');
		for (var m = node.length - 1; m >= 0; m--) {
			$(node[m]).find('td').css('display', 'table-cell');
		}
		
		for (var k in last) {
			$(that).find('tr:eq(0) td:eq('+ last[k] +')').css('display', 'none');
			for (var n = node.length - 1; n >= 0; n--) {
				$(node[n]).find('td:eq('+ last[k] +')').css('display', 'none');
			}
		}
	}
	
	function dtGetSelected(oDt) {
        var dRows = new Array();
        var rs = oDt.fnGetNodes();
        for (var i = rs.length - 1; i >= 0; i--) {
            if($(rs[i]).hasClass('row_selected')){
                dRows.push(oDt.fnGetData(rs[i]));
            }
        };
        return dRows;
    }
	
	function dtSelectAll(oDt, currentPage) {
        var rs = oDt.fnGetNodes();
        var opt = oDt.fnSettings();
        if (currentPage) {
            oDt.find('tbody tr').each(function(index){
                var row = $(this);
                var check = false;
				if ($(this).find('td input[type="checkbox"]').attr('disabled') == 'disabled') return true;
                row.toggleClass('row_selected');
                if (row.hasClass('row_selected')) {
                    check = true;
                };
                row.find('td input[type="checkbox"]').attr('checked', check);
            });
        } else {
            for (var i = rs.length - 1; i >= 0; i--) {
                var check = false;
				if ($(rs[i]).find('td input[type="checkbox"]').attr('disabled') == 'disabled') continue;
                $(rs[i]).toggleClass('row_selected');
                if ($(rs[i]).hasClass('row_selected')) {
                    check = true;
                };
                $(rs[i]).find('td input[type="checkbox"]').attr('checked', check);
            };
        }
        
    }
	
	/* cgi */
	root.cgicall =			cgicall;			//post
	root.jsonTraversal =	jsonTraversal;		//取值赋值入口
	root.jsTravGet =		jsTravGet;			//取值
	root.jsTravSet =		jsTravSet;			//赋值

	/* object */
	root.ObjToArray =		ObjToArray;			//对象转数组
	root.ObjCountLength =	ObjCountLength;		//对象长度
	root.ObjClone =			ObjClone;			//对象克隆

	/* datatable */
	root.dtReloadData =		dtReloadData;		//重绘datatable oFun为过滤
	root.dtHideColumn =		dtHideColumn;		//隐藏datatable列
	root.dtGetSelected =	dtGetSelected;		//获取datatable选中的列
	root.dtSelectAll =		dtSelectAll;		//选中所有datatable列
})(this);