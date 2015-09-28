module("luci.controller.admin.cgicall", package.seeall)

function index()
	entry({"admin", "cgicall"}).index = true
	entry({"admin", "cgicall"}, call("action_cgi")).leaf = true
end

function action_cgi()
	local socket = require("socket")
	local struct = require("struct")
	local js = require("cjson")
	local map = luci.http.formvalue()

	if not (map and map.cmd) then 
		luci.http.write_json({state = 1,msg="post cmd fail"})
		return
	end

	local cmd = map.cmd 
	local smap = js.decode(cmd)
	if not smap.key then
		luci.http.write_json({state = 1,msg="post cmd fail"})
		return
	end

	local sock, err = socket.connect("127.0.0.1", 9997)
	if not sock then
		luci.http.write_json({state = 1, msg = "connect fail " .. err})
		return
	end
	
	local arr = {smap.key, {group = "default", data = smap.data or "{}"}}	
	local s = js.encode(arr)
	sock:send(struct.pack("<I", #s) .. s)

	local chunk = sock:receive(4)
	if not chunk then 
		luci.http.write_json({state = 1, msg = "receive pack fail"})
		sock:close()
		return 
	end
	
	local len = struct.unpack("<I", chunk)
	local data, err = sock:receive(len)

	sock:close()
	if not data then 
		luci.http.write_json({state = 1, msg = "receive fail " .. err}) 
		return 
	end 

	--local data = {state = 0, data = js.decode(reply)}
	luci.http.header("Content-Type", "application/json")
	luci.http.header("Content-Length", #data)
	luci.http.write(data)
	-- luci.http.write_json({state = 1})
end
	