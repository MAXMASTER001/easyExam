export const bugun = () => {
    const zaman = new Date();
    const aylar = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];
    const tarih = (zaman.getDate() < 10 ? '0' : '') + zaman.getDate();
    function cevir(number) {
      return number < 1000 ? number + 1900 : number;
    }
    const bugu =
      aylar[zaman.getMonth()] + '/' + tarih + '/' + cevir(zaman.getYear());
    return bugu;
  };
