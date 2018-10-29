function rewrite_method_0(input_string) {
    return "Atirva az elso szerint: " + input_string;
}

function rewrite_method_1(input_string) {
    return "Atirva az masodik szerint: " + input_string;
}

function rewrite_method_2(input_string) {
    return "Atirva az harmadik szerint: " + input_string;
}


function rewrite() {
    var options = document.getElementsByName("contact");
    var active_checkbox_index = 0;
    for (let index = 0; index < options.length; index++) {
        const element = options[index];
        if(element.checked) {
            active_checkbox_index = index;
            break;
        }
    }
    
    var input_area = document.getElementById("input");
    var output_area = document.getElementById("output");
    var output_string = "";

    if(active_checkbox_index == 0) {
        output_string += rewrite_method_0(input_area.value);
    } else if (active_checkbox_index == 1) { 
        output_string += rewrite_method_1(input_area.value);
    } else {
        output_string += rewrite_method_2(input_area.value);
    }

    output_area.value = output_string;

}