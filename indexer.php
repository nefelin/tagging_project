<?php
$path = $_GET['dir'];
if (!$path) $path = './images/'; //Image Directory

//************** Implement ability to recourse directories and pass full paths. 


$image_extensions = ['jpg','jpeg','png']; //Viable Extensions
$files = scandir($path,1);
$imgCount = 0;
$imageFiles = array();

foreach (array_slice($files,0,1000) as $file){//Array slice for testing small samples.
	if (in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), $image_extensions))
		{//If it's an image file push to the array. 
			array_push($imageFiles, $path . $file);
		}
}

print json_encode($imageFiles);//Pass JSON encoded version.
?>
