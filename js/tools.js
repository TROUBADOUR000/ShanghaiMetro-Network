// 加载可选择的线路框
function load_lines(arr) {
    $("#LineSelect").empty();
    for (let item of arr) {
        let str = "<option>" + item + "</option>"
        $("#LineSelect").append(str);
    }
}

//加载可选择可输入的站点框
function load_stations(place, arr) {
    $(String(place)).empty();
    for (let item of arr) {
        $(place).editableSelect('add', String(item));
    }

}

// 比较两个集合 
function set_have_common(set1, set2) {
    var flag = false
    var t = new Set()
    for (let each of set1) {
        if (set2.has(each)) {
            flag = true
            t.add(each)
        }
    }
    return [flag, t]
}

// 返回set转化为String的形式
function set_to_string(my_set) {
    return Array.from(my_set).toString()
}

/*经纬度和实际坐标位置转换*/
function millertoXY(lon, lat) {
    // lon 经度 lat 纬度
    let L = 6381372 * Math.PI * 2  //地球周长
    let W = L  // 平面展开，将周长视为X轴
    let H = L / 2  // Y轴约等于周长一般
    let mill = 2.3  // 米勒投影中的一个常数，范围大约在正负2.3之间
    let x = lon * Math.PI / 180 // 将经度从度数转换为弧度
    let y = lat * Math.PI / 180
    //将纬度从度数转换为弧度
    y = 1.25 * Math.log(Math.tan(0.25 * Math.PI + 0.4 * y))  //这里是米勒投影的转换

    // 这里将弧度转为实际距离 ，转换结果的单位是公里
    x = (W / 2) + (W / (2 * Math.PI)) * x
    y = (H / 2) - (H / (2 * mill)) * y
    return [x, y]
}

function xy_to_coor(x, y) {
    let L = 6381372 * Math.PI * 2  //地球周长
    let W = L  // 平面展开，将周长视为X轴
    let H = L / 2  // Y轴约等于周长一般
    let mill = 2.3  // 米勒投影中的一个常数，范围大约在正负2.3之间
    let lat = ((H / 2 - y) * 2 * mill) / (1.25 * H)
    lat = ((Math.atan(Math.exp(lat)) - 0.25 * Math.PI) * 180) / (0.4 * Math.PI)
    let lon = (x - W / 2) * 360 / W
    lat = lat.toFixed(6)
    lon = lon.toFixed(6)
    return [lon, lat]
}
