// ==========================================
// 1. URL GOOGLE APPS SCRIPT & ELEMEN HTML
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0aRaHSoeGkWE8JO8fLBevmcuOQqCjfx1BhUXTVhDMNwzQRuOzQCAScAA260srM4Wz/exec"; 

// ELEMEN FORM UTAMA
const form = document.getElementById('nota-form');
const tanggalInput = document.getElementById('tanggal');
const jenisUsahaInput = document.getElementById('jenis-usaha');
const namaOrangInput = document.getElementById('nama-orang');
const namaBarangInput = document.getElementById('nama-barang');
const jumlahInput = document.getElementById('jumlah');
const nominalInput = document.getElementById('nominal');
const jenisInput = document.getElementById('jenis-transaksi');
const tabelBody = document.getElementById('tabel-body');
const btnExcelSemua = document.getElementById('btn-excel-semua');

// ELEMEN FILTER
const filterTanggalInput = document.getElementById('filter-tanggal');
const btnResetFilter = document.getElementById('btn-reset-filter');

// ELEMEN ITEM SEMENTARA
const btnTambahItem = document.getElementById('btn-tambah-item');
const tabelItemSementara = document.getElementById('tabel-item-sementara');

let itemSementara = [];
let daftarTransaksi = JSON.parse(localStorage.getItem('riwayat_nota_desa')) || [];

// Set Tanggal Default ke Hari Ini
if (tanggalInput && !tanggalInput.value) {
    tanggalInput.valueAsDate = new Date();
}

// Render awal tabel sementara
renderTabelItemSementara();

// ==========================================
// 2. KELOLA ITEM SEMENTARA (TAMBAH & HAPUS BARANG)
// ==========================================
if (btnTambahItem) {
    btnTambahItem.addEventListener('click', function() {
        tambahItemKeSementara();
    });
}

function tambahItemKeSementara() {
    const namaBarang = namaBarangInput ? namaBarangInput.value.trim() : '';
    const jumlah = parseInt(jumlahInput ? jumlahInput.value : 1) || 1;
    const nominal = parseInt(nominalInput ? nominalInput.value : 0) || 0;

    if (!namaBarang) {
        alert('Silakan isi Nama Barang / Keperluan!');
        if (namaBarangInput) namaBarangInput.focus();
        return false;
    }

    if (nominal <= 0) {
        alert('Silakan masukkan Nominal / Harga Satuan yang valid!');
        if (nominalInput) nominalInput.focus();
        return false;
    }

    // Masukkan ke array sementara
    itemSementara.push({
        namaBarang: namaBarang,
        jumlah: jumlah,
        nominal: nominal
    });

    // Reset input barang & kembalikan fokus ke Nama Barang
    if (namaBarangInput) namaBarangInput.value = '';
    if (jumlahInput) jumlahInput.value = 1;
    if (nominalInput) nominalInput.value = '';
    if (namaBarangInput) namaBarangInput.focus();

    renderTabelItemSementara();
    return true;
}

function renderTabelItemSementara() {
    if (!tabelItemSementara) return;
    tabelItemSementara.innerHTML = '';

    if (itemSementara.length === 0) {
        tabelItemSementara.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888; padding: 12px;">Belum ada item ditambahkan</td></tr>';
        return;
    }

    itemSementara.forEach((item, index) => {
        const total = item.jumlah * item.nominal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.namaBarang}</td>
            <td style="text-align: center;">${item.jumlah}</td>
            <td style="text-align: right;">Rp ${item.nominal.toLocaleString('id-ID')}</td>
            <td style="text-align: right; font-weight: 600;">Rp ${total.toLocaleString('id-ID')}</td>
            <td style="text-align: center;">
                <button type="button" onclick="hapusItemSementara(${index})" title="Hapus Item">❌</button>
            </td>
        `;
        tabelItemSementara.appendChild(row);
    });
}

function hapusItemSementara(index) {
    itemSementara.splice(index, 1);
    renderTabelItemSementara();
}

// ==========================================
// 3. RENDER TABEL RIWAYAT TRANSAKSI
// ==========================================
function renderTabel() {
    if (!tabelBody) return;
    tabelBody.innerHTML = '';
    
    // Terapkan Filter Tanggal jika diisi
    const filterTgl = filterTanggalInput ? filterTanggalInput.value : '';
    let dataTampil = daftarTransaksi;

    if (filterTgl) {
        dataTampil = daftarTransaksi.filter(t => t.tanggal === filterTgl);
    }

    if (dataTampil.length === 0) {
        tabelBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #888; padding: 15px;">Data transaksi tidak ditemukan</td></tr>';
        return;
    }

    dataTampil.forEach((transaksi, index) => {
        const formatTanggal = new Date(transaksi.tanggal).toLocaleDateString('id-ID');
        const originalIndex = daftarTransaksi.indexOf(transaksi);
        
        // Normalisasi daftar barang
        let itemsList = [];
        if (transaksi.items && transaksi.items.length > 0) {
            itemsList = transaksi.items;
        } else {
            itemsList = [{
                namaBarang: transaksi.namaBarang || '-',
                jumlah: transaksi.jumlah || 1,
                nominal: transaksi.nominal || 0
            }];
        }

        const totalBaris = itemsList.length;

        itemsList.forEach((item, itemIdx) => {
            const tr = document.createElement('tr');
            const subtotalItem = (item.jumlah || 1) * (item.nominal || 0);

            if (itemIdx === 0) {
                tr.className = 'main-row';
                tr.innerHTML = `
                    <td rowspan="${totalBaris}" style="text-align: center;"><strong>${index + 1}</strong></td>
                    <td rowspan="${totalBaris}"><strong>${transaksi.id || '-'}</strong></td>
                    <td rowspan="${totalBaris}">${formatTanggal}</td>
                    <td rowspan="${totalBaris}"><strong>${transaksi.jenisUsaha || '-'}</strong></td>
                    <td rowspan="${totalBaris}">${transaksi.namaOrang || '-'}</td>
                    
                    <td>${item.namaBarang} (${item.jumlah}x)</td>
                    <td class="${transaksi.jenis}">${transaksi.jenis === 'masuk' ? 'Uang Masuk' : 'Uang Keluar'}</td>
                    <td>Rp ${subtotalItem.toLocaleString('id-ID')}</td>
                    <td rowspan="${totalBaris}">
                        <div class="aksi-container">
                            <button type="button" class="btn-aksi btn-hapus" onclick="hapusTransaksi(${originalIndex})" title="Hapus Data">🗑️</button>
                            <button type="button" class="btn-aksi btn-cetak" onclick="prosesCetakNota(${originalIndex})" title="Cetak Nota">🖨️</button>
                            <button type="button" class="btn-aksi btn-update" onclick="perbaruiGoogleSheets()" title="Sinkronkan ke Google Sheets">🔄</button>
                        </div>
                    </td>
                `;
            } else {
                tr.className = 'sub-row';
                tr.innerHTML = `
                    <td>${item.namaBarang} (${item.jumlah}x)</td>
                    <td class="${transaksi.jenis}">${transaksi.jenis === 'masuk' ? 'Uang Masuk' : 'Uang Keluar'}</td>
                    <td>Rp ${subtotalItem.toLocaleString('id-ID')}</td>
                `;
            }

            tabelBody.appendChild(tr);
        });
    });
}

// Event Listener Filter Tanggal
if (filterTanggalInput) {
    filterTanggalInput.addEventListener('change', renderTabel);
}

if (btnResetFilter) {
    btnResetFilter.addEventListener('click', function() {
        if (filterTanggalInput) filterTanggalInput.value = '';
        renderTabel();
    });
}

// ==========================================
// 4. GENERATE ID UNIK TRANSAKSI (DIPERBAIKI)
// ==========================================
function buatKodeIDStatis(jenis, jenisUsahaVal, tanggalInputVal) {
    const kodeJenis = (jenis === 'masuk') ? 'BM' : 'BK';
    let kodeUsaha = 'UMUM';
    
    if (jenisUsahaVal) {
        const u = jenisUsahaVal.trim().toLowerCase();
        if (u.includes('air')) kodeUsaha = 'AIR';
        else if (u.includes('ruko') || u.includes('sewa')) kodeUsaha = 'RUKO';
        else if (u.includes('sampah')) kodeUsaha = 'SMPH';
        else if (u.includes('lele') || u.includes('kolam')) kodeUsaha = 'LELE';
        else {
            const bersihkanTeks = u.replace(/[^a-z0-9]/g, '');
            kodeUsaha = bersihkanTeks.substring(0, 4).toUpperCase() || 'UMUM';
        }
    }
    
    // Format Tanggal YYYYMMDD
    const tglFormatted = tanggalInputVal ? tanggalInputVal.replace(/-/g, '') : new Date().toISOString().slice(0,10).replace(/-/g, '');

    // Awalan ID yang dicari: e.g. "BM-AIR-20260810-"
    const prefixID = `${kodeJenis}-${kodeUsaha}-${tglFormatted}-`;

    // Cari angka terbesar dari ID transaksi yang memiliki prefixID sama
    let maxUrutan = 0;
    daftarTransaksi.forEach(t => {
        if (t.id && t.id.startsWith(prefixID)) {
            const bagian = t.id.split('-');
            const nomorStr = bagian[bagian.length - 1];
            const nomorAngka = parseInt(nomorStr, 10);
            if (!isNaN(nomorAngka) && nomorAngka > maxUrutan) {
                maxUrutan = nomorAngka;
            }
        }
    });

    const nomorUrutBaru = String(maxUrutan + 1).padStart(3, '0');
    return `${prefixID}${nomorUrutBaru}`;
}

// ==========================================
// 5. SUBMIT FORM UTAMA (SIMPAN TRANSAKSI)
// ==========================================
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Jika user belum klik "+ Tambah Barang" tapi input barang terisi
        const namaBarangSisa = namaBarangInput ? namaBarangInput.value.trim() : '';
        const nominalSisa = parseInt(nominalInput ? nominalInput.value : 0) || 0;

        if (namaBarangSisa && nominalSisa > 0) {
            itemSementara.push({
                namaBarang: namaBarangSisa,
                jumlah: parseInt(jumlahInput.value) || 1,
                nominal: nominalSisa
            });
            if (namaBarangInput) namaBarangInput.value = '';
            if (nominalInput) nominalInput.value = '';
            if (jumlahInput) jumlahInput.value = 1;
        }

        if (itemSementara.length === 0) {
            alert('Silakan tambahkan minimal 1 barang terlebih dahulu dengan mengisi input lalu menekan tombol "➕ Tambah Barang"!');
            if (namaBarangInput) namaBarangInput.focus();
            return;
        }

        const idUnikBaru = buatKodeIDStatis(jenisInput.value, jenisUsahaInput.value, tanggalInput.value);
        const totalNominal = itemSementara.reduce((sum, item) => sum + (item.jumlah * item.nominal), 0);
        const ringkasanNamaBarang = itemSementara.map(i => `${i.namaBarang} (${i.jumlah}x)`).join(', ');
        const totalQty = itemSementara.reduce((sum, item) => sum + item.jumlah, 0);

        const dataBaru = {
            id: idUnikBaru,
            tanggal: tanggalInput.value,
            jenisUsaha: jenisUsahaInput.value,
            namaOrang: namaOrangInput ? namaOrangInput.value : '',
            items: [...itemSementara],
            namaBarang: ringkasanNamaBarang,
            jumlah: totalQty,
            nominal: totalNominal,
            jenis: jenisInput.value
        };

        daftarTransaksi.push(dataBaru);
        localStorage.setItem('riwayat_nota_desa', JSON.stringify(daftarTransaksi));
        
        // Reset item sementara & form
        itemSementara = [];
        renderTabelItemSementara();
        renderTabel();
        
        form.reset();
        if (tanggalInput) tanggalInput.valueAsDate = new Date();
        if (jumlahInput) jumlahInput.value = 1;
    });
}

// ==========================================
// 6. HAPUS TRANSAKSI
// ==========================================
function hapusTransaksi(index) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        daftarTransaksi.splice(index, 1);
        localStorage.setItem('riwayat_nota_desa', JSON.stringify(daftarTransaksi));
        renderTabel();
    }
}

// ==========================================
// 7. CETAK NOTA
// ==========================================
function prosesCetakNota(index) {
    const item = daftarTransaksi[index];
    
    const elemNotaId = document.getElementById('nota-id');
    const elemNotaNama = document.getElementById('nota-nama');
    const elemNotaTgl = document.getElementById('nota-tanggal');
    const elemNotaUsaha = document.getElementById('nota-usaha');
    const elemNotaJenis = document.getElementById('nota-jenis');
    const elemNotaItemsBody = document.getElementById('nota-items-body');
    const elemNotaTotalNominal = document.getElementById('nota-total-nominal');

    if (elemNotaId) elemNotaId.innerText = item.id || '-';
    if (elemNotaNama) elemNotaNama.innerText = item.namaOrang || '-';
    if (elemNotaTgl) elemNotaTgl.innerText = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (elemNotaUsaha) elemNotaUsaha.innerText = item.jenisUsaha || '-';
    if (elemNotaJenis) elemNotaJenis.innerText = item.jenis === 'masuk' ? 'Uang Masuk (Pemasukan)' : 'Uang Keluar (Pengeluaran)';

    if (elemNotaItemsBody) {
        elemNotaItemsBody.innerHTML = '';
        const daftarBarang = (item.items && item.items.length > 0) 
            ? item.items 
            : [{ namaBarang: item.namaBarang, jumlah: item.jumlah || 1, nominal: item.nominal }];

        daftarBarang.forEach(barang => {
            const subtotal = (barang.jumlah || 1) * (barang.nominal || 0);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${barang.namaBarang}</td>
                <td style="text-align: center;">${barang.jumlah || 1}</td>
                <td style="text-align: right;">Rp ${parseInt(barang.nominal || 0).toLocaleString('id-ID')}</td>
                <td style="text-align: right;">Rp ${subtotal.toLocaleString('id-ID')}</td>
            `;
            elemNotaItemsBody.appendChild(row);
        });
    }

    if (elemNotaTotalNominal) {
        elemNotaTotalNominal.innerText = `Rp ${parseInt(item.nominal || 0).toLocaleString('id-ID')}`;
    }

    window.print();
}

// ==========================================
// 8. SINKRONISASI GOOGLE SHEETS
// ==========================================
function perbaruiGoogleSheets() {
    if (daftarTransaksi.length === 0) {
        alert("Tidak ada data transaksi di tabel untuk di-update!");
        return;
    }

    const tombolUpdate = document.querySelectorAll('.btn-update');
    tombolUpdate.forEach(btn => btn.innerText = "⏳");

    const payload = new FormData();
    payload.append('data', JSON.stringify(daftarTransaksi));

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: payload
    })
    .then(() => {
        alert("BERHASIL! Data telah dikirim ke Google Sheets.");
        renderTabel();
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Gagal mengirim data. Cek koneksi internet Anda.");
        renderTabel();
    });
}

// ==========================================
// 9. EKSPOR KE EXCEL
// ==========================================
function downloadExcelLangsung() {
    if (daftarTransaksi.length === 0) {
        alert("Tidak ada data transaksi untuk diunduh!");
        return;
    }

    let totalMasuk = 0;
    let totalKeluar = 0;

    const dataExcel = [];
    
    daftarTransaksi.forEach((item, index) => {
        const nominal = parseInt(item.nominal) || 0;
        const masuk = (item.jenis === 'masuk') ? nominal : 0;
        const keluar = (item.jenis === 'keluar') ? nominal : 0;

        totalMasuk += masuk;
        totalKeluar += keluar;

        const itemsList = (item.items && item.items.length > 0) 
            ? item.items 
            : [{ namaBarang: item.namaBarang, jumlah: item.jumlah || 1, nominal: item.nominal }];

        itemsList.forEach((subItem, itemIdx) => {
            const subtotalItem = (subItem.jumlah || 1) * (subItem.nominal || 0);
            dataExcel.push({
                "No": itemIdx === 0 ? index + 1 : "",
                "No. Transaksi": itemIdx === 0 ? (item.id || '-') : "",
                "Tanggal": itemIdx === 0 ? new Date(item.tanggal).toLocaleDateString('id-ID') : "",
                "Jenis Usaha": itemIdx === 0 ? (item.jenisUsaha || '-') : "",
                "Nama (Penerima/Pelanggan)": itemIdx === 0 ? (item.namaOrang || '-') : "",
                "Nama Barang / Keperluan": `${subItem.namaBarang} (${subItem.jumlah}x)`,
                "Uang Masuk (Rp)": item.jenis === 'masuk' ? subtotalItem : 0,
                "Uang Keluar (Rp)": item.jenis === 'keluar' ? subtotalItem : 0
            });
        });
    });

    dataExcel.push({
        "No": "", "No. Transaksi": "", "Tanggal": "", "Jenis Usaha": "", "Nama (Penerima/Pelanggan)": "",
        "Nama Barang / Keperluan": "TOTAL",
        "Uang Masuk (Rp)": totalMasuk, "Uang Keluar (Rp)": totalKeluar
    });

    dataExcel.push({
        "No": "", "No. Transaksi": "", "Tanggal": "", "Jenis Usaha": "", "Nama (Penerima/Pelanggan)": "",
        "Nama Barang / Keperluan": "SALDO AKHIR",
        "Uang Masuk (Rp)": totalMasuk - totalKeluar, "Uang Keluar (Rp)": ""
    });

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    XLSX.writeFile(workbook, `Laporan_Keuangan_Desa_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

if (btnExcelSemua) {
    btnExcelSemua.addEventListener('click', downloadExcelLangsung);
}

// Render awal riwayat transaksi saat halaman dimuat
renderTabel();