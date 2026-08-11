<?php

$replacements = [
    'function Beranda Utama' => 'function Dashboard',
    'function Data Induk' => 'function MasterData',
    'function Pengaturan Umum' => 'function Settings',
    'const Beranda Utama' => 'const Dashboard',
    'const Data Induk' => 'const MasterData',
    'const Pengaturan Umum' => 'const Settings',
];

$dir = new RecursiveDirectoryIterator(__DIR__ . '/resources/js');
$ite = new RecursiveIteratorIterator($dir);
$files = new RegexIterator($ite, '/^.+\.jsx$/i', RecursiveRegexIterator::GET_MATCH);

$count = 0;
foreach ($files as $file) {
    $filePath = $file[0];
    $content = file_get_contents($filePath);
    
    $newContent = str_replace(array_keys($replacements), array_values($replacements), $content);
    
    if ($content !== $newContent) {
        file_put_contents($filePath, $newContent);
        echo "Fixed function names in $filePath\n";
        $count++;
    }
}

echo "Done fixing function names in $count files.\n";
