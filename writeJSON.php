<?php //Make this more secore, probably with htaccess
	$allData = json_decode(file_get_contents("php://input"), true);
	echo "Writing: " . $allData[data];
	echo "to Path: " . $allData[path];
    file_put_contents($allData[path],$allData[data]);  
?>