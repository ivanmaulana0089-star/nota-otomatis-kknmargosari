<?php
// Mengatur header agar browser mengenali file sebagai Excel resmi tanpa corrupt
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=Laporan_Keuangan_Desa_Lengkap.xls");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Cache-Control: private", false);

// Menangkap data JSON transaksi yang dikirimkan oleh JavaScript
$data_mentah = isset($_POST['data_transaksi']) ? $_POST['data_transaksi'] : '[]';
$daftar_transaksi = json_decode($data_mentah, true);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .title { font-family: 'Arial'; font-size: 14pt; font-weight: bold; text-align: center; }
        .subtitle { font-family: 'Arial'; font-size: 11pt; text-align: center; font-style: italic; }
        .table-laporan { border-collapse: collapse; width: 100%; font-family: 'Arial'; font-size: 10pt; }
        .table-laporan th { background-color: #2c3e50; color: #ffffff; border: 1px solid #000000; padding: 8px; text-align: center; font-weight: bold; }
        .table-laporan td { border: 1px solid #000000; padding: 6px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .uang-masuk { color: #27ae60; }
        .uang-keluar { color: #c0392b; }
        .total-row { background-color: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>

    <!-- Header Laporan Formal Excel -->
    <div class="title">LAPORAN REKAPITULASI KEUANGAN DESA MARGOSARI</div>
    <div class="subtitle">Kecamatan Limbangan, Kabupaten Kendal</div>
    <br>

    <!-- Tabel Data Keuangan -->
    <table class="table-laporan">
        <thead>
            <tr>
                <th width="50">No</th>
                <th width="120">ID Transaksi</th>
                <th width="120">Tanggal</th>
                <th width="280">Nama Barang / Keperluan</th>
                <th width="130">Jenis Transaksi</th>
                <th width="150">Nominal Uang Masuk (Rp)</th>
                <th width="150">Nominal Uang Keluar (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $no = 1;
            $baris_awal = 6; // Menghitung baris mulainya data di Excel untuk keperluan rumus matematika
            if (!empty($daftar_transaksi)) {
                foreach ($daftar_transaksi as $dt) {
                    // Format penulisan tanggal Indonesia
                    $tanggal = date("d/m/Y", strtotime($dt['tanggal']));
                    $is_masuk = ($dt['jenis'] === 'masuk');
                    ?>
                    <tr>
                        <td class="text-center"><?= $no++; ?></td>
                        <td class="text-center">'<?= htmlspecialchars($dt['id']); ?></td>
                        <td class="text-center"><?= $tanggal; ?></td>
                        <td><?= htmlspecialchars($dt['namaBarang']); ?></td>
                        <td class="text-center <?= $dt['jenis']; ?>"><?= $is_masuk ? 'Uang Masuk' : 'Uang Keluar'; ?></td>
                        <!-- Pisahkan kolom masuk dan keluar agar pembukuan Excel rapi -->
                        <td class="text-right <?= $is_masuk ? 'uang-masuk' : ''; ?>"><?= $is_masuk ? $dt['nominal'] : 0; ?></td>
                        <td class="text-right <?= !$is_masuk ? 'uang-keluar' : ''; ?>"><?= $is_masuk ? 0 : $dt['nominal']; ?></td>
                    </tr>
                    <?php
                }
            } else {
                echo '<tr><td colspan="7" class="text-center">Tidak ada data transaksi</td></tr>';
            }
            
            $baris_akhir = $baris_awal + count($daftar_transaksi) - 1;
            ?>
            
            <!-- Baris Rumus Otomatis Excel (SUM) -->
            <tr class="total-row">
                <td colspan="5" class="text-right font-bold">Total Pengeluaran & Pemasukan:</td>
                <!-- Menggunakan rumus formula asli Excel agar nilainya dinamis -->
                <td class="text-right font-bold">=SUM(F<?= $baris_awal; ?>:F<?= $baris_akhir; ?>)</td>
                <td class="text-right font-bold">=SUM(G<?= $baris_awal; ?>:G<?= $baris_akhir; ?>)</td>
            </tr>
            <tr class="total-row">
                <td colspan="5" class="text-right font-bold">Saldo Akhir Kas Desa:</td>
                <td colspan="2" class="text-center font-bold" style="background-color: #d4edda; color: #155724;">=F<?= $baris_akhir + 1; ?>-G<?= $baris_akhir + 1; ?></td>
            </tr>
        </tbody>
    </table>

</body>
</html>
