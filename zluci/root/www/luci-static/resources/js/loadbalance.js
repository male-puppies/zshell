
var dataCon,
	cloneData;

$(document).ready(function() {
	initData();
	initEvent();
});

function initData() {
	cgicall('RDS.GetBandSupport("")', function(band) {
		cgicall('RDS.GetLoadBalance("")', function(d) {
			if (band == "2g") {
				$("#load_balance__priority_5g").closest(".control-group").css("display", "none");
			} else {
				$("#load_balance__priority_5g").closest(".control-group").css("display", "block");
			}
			cloneData = cloneObj(d);
			dataCon = d;
			jsonTraversal(d, jsTravSet);
			OnDisabledChanged(d.load_balance.load_enable, '.load_disinput');
			OnDisabledChanged(d.sta_tenacious.sta_enable, '.pre_disinput');
		});
	});
}

function saveSubmit() {
	if(!verification()) return;
	
	jsonTraversal(dataCon, jsTravGet);
	var obj = {};
	obj.data = dataCon;
	obj.oldData = cloneData;

	cgicall('RDS.SaveLoadBalance(%j)', obj, function(d) {
		d.status == '0' ? window.location.reload() : alert('保存失败！');
	});
}

function initEvent() {
	$('#sta_tenacious__sta_enable').on('click', function() {
		OnDisabledChanged($(this).attr('checked') == 'checked' ? '1' : '0', '.pre_disinput');
	});
	$('#load_balance__load_enable').on('click', function() {
		OnDisabledChanged($(this).attr('checked') == 'checked' ? '1' : '0', '.load_disinput');
	});
	$('#btn_submit').on('click', saveSubmit);
}

function cloneObj(myObj) { 
	if (typeof(myObj) != 'object') return myObj; 
	if (myObj == null) return myObj; 
	var myNewObj = new Object(); 
	for(var i in myObj) 
		myNewObj[i] = cloneObj(myObj[i]); 
	return myNewObj; 
}
