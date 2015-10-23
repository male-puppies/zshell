var oTable,
	clearInitData;

$(document).ready(function(){
	oTable = createDtUser();
	initData();
});

function createDtUser() {
	return $('#online_user_list').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
		    {
				"mData": null,
				"sWidth": 80
			},
			{
				"mData": "name"
			},
			{
				"mData": "ip"
			},
            {
				"mData": "mac"
        	},
            {
				"mData": "elapse",
				"mRender": function(d, t, f) {
					var days = parseInt(d/(60*60*24));
					var hours = parseInt(d/60/60 - days*24);
					var minutes = parseInt(d/60 - hours*60 - days*24);
					if (days > 0) {
						return days + "天" + hours + "时" + minutes + "分";
					} else if (hours > 0) {
						return hours +"时" + minutes + "分";
					} else if (minutes > 0) {
						return minutes + "分";
					} else {
						return d + "秒";
					}
				}
			},
            {
				"mData": "mac",
				"bSortable" : false,
				"mRender": function(d, t, f) {
			  		return '<a href="javascript:;" class="offline" onclick="offline(\'' + d + '\')">强制下线</a>';
			  	}
			}
        ],
		"fnDrawCallback": function() {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
		}
    });
}

function setTimeInitData() {
	clearTimeout(clearInitData);
	clearInitData = setTimeout(function(){
		initData();
   	}, 5000);
}

function initData() {
	cgicall("OnlineGet", function(d) {
		if (d.status == 0) {
			dtReloadData(oTable, dtObjToArray(d.data), true);
			setTimeInitData();	
		} else {
			console.log("OnlineGet error " + (d.data ? d.data : ""));
		}
	});
}

function offline(mac) {
	var arr = [];
	arr.push(mac);
	cgicall("OnlineDel", arr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("操作失败！" + (d.data ? d.data : ""));
		}
	});
}

       
