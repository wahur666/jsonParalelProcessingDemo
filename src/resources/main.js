var options = document.getElementsByName("contact");

function rewrite_method_0(input_string) {
	var string_array = input_string.split("\n");
	var array_size = string_array.length;
	
	var kom="";
	for(var i = (array_size-2); i>=0; i--){
		if(string_array[i].split("(")[0] == "ASSIGN"){
			
			//első ASSIGN
			if(string_array[i].includes("promote(data")){
				string_array[i] = string_array[i].replace(".json", ".xml");
				string_array[i] = string_array[i].replace("(promote(data", "").replace(", string))", "").replace("))", ")");
			}
			else{ //második ASSIGN
				if(string_array[i].includes("keys-or-members")){
					kom = string_array[i].split("keys-or-members(")[1].split(")")[0];
					string_array[i] = "";
				}
			}
		}else if(string_array[i].split("(")[0] == "UNNEST"){
			if(string_array[i].includes("iterate")){
				var pattern = /[$0-9]+/g;
				string_array[i] = string_array[i].replace("iterate", "keys-or-members");
			}
		}		
	}
    return string_array.filter(str => str != "").join("\n");
}

function rewrite_method_1(input_string) {
    return "Atirva az masodik szerint: " + input_string;
}

function rewrite_method_2(input_string) {
    return "Atirva az harmadik szerint: " + input_string;
}


function rewrite() {
    var active_checkbox_index = getCheckboxIndex();
    
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

function demo(){
	var active_checkbox_index = getCheckboxIndex();
    var input_area = document.getElementById("input");
	if(active_checkbox_index == 0){
		input_area.value = "DISTRIBUTE-RESULT($$9)\nUNNEST($$9:iterate($$8))\nASSIGN($$8:(keys-or-members($$2)))\nASSIGN($$2:value(value(json-doc(promote(data(\"book.json\"), string)), \"bookstore\"), \"book\"))\nEMPTY-TUPLE-SOURCE"
	}else if (active_checkbox_index == 1){
		input_area.value = "DISTRIBUTE-RESULT($$13)\nUNNEST($$13:keys-or-members($$6))\nASSIGN($$6:value(value($$4, \"bookstore\"), \"book\"))\nUNNEST($$4:iterate($$2))\nASSIGN(collection(\"/books\"), $$2)\nEMPTY-TUPLE-SOURCE";
	}else{
		input_area.value = "DISTRIBUTE-RESULT($$20)\nUNNEST($$20:iterate($$19))\nASSIGN($$19:count(value($$18, \"title\")))\nASSIGN($$18:treat(item,$$16))\nGROUP-BY($$17:0-<$$14){\n\tAGGREGATE($$16:create_sequence($$13))\n}\nASSIGN($$14:data(value($$13,\"author\")))\nDATASCAN(collection(\"/books\"), $$13, (\"bookstore\")(\"book\")())\nEMPTY-TUPLE-SOURCE";
	}
}

function getCheckboxIndex(){
	var CH_index = 0;
    for (let index = 0; index < options.length; index++) {
        const element = options[index];
        if(element.checked) {
            CH_index = index;
            break;
        }
    }
	return CH_index;
}
