// I have no idea what's working, but you need
// <script type="text/javascript" src="lib/d3.min.js"></script>
// In the main page html

function string_to_int_array(input_str) {
    all_ints = input_str.split(',');
    var int_array = [];
    for (var i = 0, val; val = all_ints[i]; i++) {
        int_array.push(val);
    }
    return int_array;
}

function split_b_k(data) {
    var b_rows = [];
    var k_rows = [];
    for (var i = 0, row; row = data[i]; i++) {
        if (b_ids.includes(row.TYPE)) {
            b_rows.push({'ID' : row.ID,
                         'BODY' : row.BODY,
                         'date' : new Date(parseInt(row.DATE_SENT, 10))});
        }
        else if (k_ids.includes(row.TYPE)) {
            k_rows.push({'ID' : row.ID,
                         'BODY' : row.BODY,
                         'date' : new Date(parseInt(row.DATE_SENT, 10))});
        }
    }

    return {"b_rows" : b_rows, "k_rows" : k_rows};
}

function total_to_from_messages(split_data) {
    return [split_data.b_rows.length, split_data.k_rows.length];
}

function total_chars(data) {
    return data.map(function(item) {
        return item.BODY.length;
    }).reduce(function(total, num) {
        return total + num;
    }, 0);
}

function total_to_from_chars(split_data) {
    return [total_chars(split_data.b_rows), total_chars(split_data.k_rows)];
}

function x_y_time_of_day_msg(data) {
    all_hours = {};
    for (var i = 0; i < 24; i++) {
        all_hours[i] = 0;
    }

    return data.map(function(item) {
        return item.date.getHours();
    }).reduce(function(histo, hour) {
        histo[hour] = +histo[hour] + 1;
        return histo;
    }, all_hours);
}

// TODO: write a function that gets the min/max date
// TODO: write a map-reduce that increments msg count/char count
//       for all dates between min/max

function handleFileSelect(evt) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a',') =',
                        f.size, ' bytes, last modified: ',
                        f.lastModifiedDate ?
                        f.lastModifiedDate.toLocaleDateString() : 'n/a',
                        '</li>');
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    csv_obj = d3.csvParse(e.target.result);
                    split_data = split_b_k(csv_obj);
                    msgs_split = total_to_from_messages(split_data);
                    chars_split = total_to_from_chars(split_data);
                    time_of_days = x_y_time_of_day_msg(split_data.b_rows);
                    console.log(time_of_days);
                    d3.select("#num_msgs").append("span").html(
                        '<br/>' + b_name +  ': ' + msgs_split[0] + ', ' + chars_split[0] + ' chars' +
                        '<br/>' + k_name + ': ' + msgs_split[1] + ', ' + chars_split[1] + ' chars');
                };
            })(f);
            reader.readAsText(f);
        }
        document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}
