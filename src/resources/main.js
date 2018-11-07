var options = document.getElementsByName("contact");
var clicks = 0;

//todo: $n-ek nem teljesen jók még !! (mindhárom szabályban átírom majd, ha lesz kedvem. Lényeg megvan.)

function rewrite_method_0(input_string) {
	var string_array = input_string.split("\n");
	var array_size = string_array.length;
	
	var kom="";
	for(var i = (array_size-2); i>=0; i--){
		if(string_array[i].split("(")[0] == "ASSIGN"){
			
			if(string_array[i].includes("promote(data")){
				string_array[i] = string_array[i].replace(".json", ".xml");
				string_array[i] = string_array[i].replace("(promote(data", "").replace(", string))", "").replace("))", ")");
			}
			else if(string_array[i].includes("keys-or-members")){
				kom = string_array[i].split("keys-or-members(")[1].split(")")[0];
				string_array[i] = "";
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
	var string_array = input_string.split("\n");
	var array_size = string_array.length;
	var datascan_index = 0;
	for(var i = (array_size-2); i>=0; i--){
		if(string_array[i].split("(")[0] == "ASSIGN"){
			//ASSIGN Datascan-be
			if(string_array[i].includes("collection")){
				string_array[i] = string_array[i].replace("ASSIGN", "DATASCAN")
				datascan_index = i;
			}
			else if(string_array[i].includes("value(")){
				string_array[i] = string_array[i].split("value(")[2].replace(")", "").replace("))", "");
				string_array[i] = string_array[i].replace(/ \"/g, "(\"").replace("\",", ")");
				var temp = string_array[i].split("\"");
				temp[temp.length-1] = ")())"; 
				
				var toReplace = string_array[datascan_index].split(",")[1] 
				string_array[datascan_index] = string_array[datascan_index].replace(toReplace, (temp.join("\"")));				
				string_array[i] = "";
			}
		}else if(string_array[i].split("(")[0] == "UNNEST"){
			string_array[i] = "";
		}
	}
	return string_array.filter(str => str != "").join("\n");
}

function rewrite_method_2(input_string) {
	clicks += 1;
	
	if(clicks == 1){
		var string_array = input_string.split("\n");
		var array_size = string_array.length;
		
		for(var i=(array_size-2); i>0; i--){
			//két egymás utáni assign -> subplan
			if(string_array[i].split("(")[0]=="ASSIGN" &&  string_array[i-1].split("(")[0] == "ASSIGN"){
				if(string_array[i-1].includes("count")){
					string_array[i-1] = "SUBPLAN{\n\t" + string_array[i-1].replace("ASSIGN", "AGGREGATE");
					string_array[i] = "\t" + string_array[i].replace("ASSIGN", "UNNEST").replace("treat(item,", "iterate(") + "\n}";
				}
			}
		}
		
		return string_array.filter(str => str != "").join("\n");
		
	}else if(clicks == 2){
		var tempAggregate = "";
		var subplan_index = 0;
		var string_array = (document.getElementById("output").value).split("\n");
		var array_size = string_array.length;
		
		for(var i=0; i<array_size; i++){
			if(string_array[i].includes("AGGREGATE")){
				subplan_index = i-1;
				if(string_array[i].includes("create_sequence")){
					var temp = string_array[i].split(":")[1];
					string_array[i] = string_array[i].replace(temp, tempAggregate);
				}
				else{
					tempAggregate = string_array[i].split(":")[1];
					for(var j=0; j<=3; j++){
						string_array[subplan_index+j] = "";
					}
				}
			}
		}
		return string_array.filter(str => str != "").join("\n");
	}
	
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
	var query_area = document.getElementById("query");
	
	if(active_checkbox_index == 0){
		input_area.value = "DISTRIBUTE-RESULT($$9)\nUNNEST($$9:iterate($$8))\nASSIGN($$8:(keys-or-members($$2)))\nASSIGN($$2:value(value(json-doc(promote(data(\"book.json\"), string)), \"bookstore\"), \"book\"))\nEMPTY-TUPLE-SOURCE"
		query_area.value = "json-doc(\"books.json\")(\"bookstore\")(\"book\")()";
	}else if (active_checkbox_index == 1){
		input_area.value = "DISTRIBUTE-RESULT($$13)\nUNNEST($$13:keys-or-members($$6))\nASSIGN($$6:value(value($$4, \"bookstore\"), \"book\"))\nUNNEST($$4:iterate($$2))\nASSIGN(collection(\"/books\"), $$2)\nEMPTY-TUPLE-SOURCE";
		query_area.value = "collection(\"/books\")(\"bookstore\")(\"book\")()";
	}else{
		input_area.value = "DISTRIBUTE-RESULT($$20)\nUNNEST($$20:iterate($$19))\nASSIGN($$19:count(value($$18, \"title\")))\nASSIGN($$18:treat(item,$$16))\nGROUP-BY($$17:0->$$14){\n\tAGGREGATE($$16:create_sequence($$13))\n}\nASSIGN($$14:data(value($$13,\"author\")))\nDATASCAN(collection(\"/books\"), $$13, (\"bookstore\")(\"book\")())\nEMPTY-TUPLE-SOURCE";
		query_area.value = "for $x in collection(\"/books\")(\"bookstore\")(\"books\")()\ngroup by $author:=$x(\"author\")\nreturn count(for $j in $x return $j(\"title\"))";
	}
}

function reset(){
    var input_area = document.getElementById("input");
	var output_area = document.getElementById("output");
	var query_area = document.getElementById("query");
	
	input_area.value = "";
	output_area.value = "";
	query_area.value = "";
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
