const con = require('./connection');

module.exports.register = async function(request,h){
    try {
        const { email, name, password } = request.payload;
        // cek email sudah ada di db atau tidak
        const [result] = await con.query('SELECT * From users WHERE email = "'+email+'" ');
        if(result.length === 0){
            const [resInsert,metadata] = await con.query('INSERT INTO `users`(`name`, `password`, `email`) VALUES ("'+name+'","'+password+'","'+email+'")');
            console.log(metadata);
            if(metadata === 1){
                const response = h.response({
                    status: 'success',
                    message: 'berhasil membuat akun',
                  });
                response.code(201);
                return response
            }
            else{
                const response = h.response({
                    status: 'error',
                    message: 'terjadi kesalahan dengan server',
                  });
                response.code(500);
                return response
            }
        }
        else{
            const response = h.response({
                status: 'error',
                message: 'tidak dapat membuat akun',
              });
            response.code(500);
            return response
        }
        
    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

module.exports.login = async function(request,h){
    try {
        const { email, password } = request.payload;
        const [result,error] = await con.query('SELECT id_user,name From users WHERE email = "'+email+'" and password = "'+password+'" ');
        if(result.length >0){
                let id_user = (result[0].id_user);
                let name = (result[0].name);
                const response = h.response({
                    status: 'success',
                    message: 'berhasil melakukan login',
                    data: {
                        userid: id_user,
                        name: name
                    }
                  });
                response.code(201);
                return response
            }
            else{
                const response = h.response({
                    status: 'error',
                    message: 'gagal untuk login, silahkan periksa kembali email atau password anda',
                  });
                response.code(500);
                return response
            }
    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

module.exports.home = async function(request,h){
    try {
        const{userid} = request.payload;
        let progress = 0;
        //mencari kelas yang sudah diikuti user
        const [user_class] = await con.query('Select classes_id, lastest_module, status,recent_modul from progress where users_id='+userid+' ORDER BY update_at DESC LIMIT 1');
        if(user_class.length >0){
            const class_id = user_class[0].classes_id;
            //mengambil data kelas dari db
            const [kelas] = await con.query('Select * from classes where id_class='+class_id+'');
            //menghitung progress user
            progress = user_class[0].lastest_module / kelas[0].total_module * 100;
            // console.log(progress);
            const response = h.response({
                status: 'success',
                data: {
                    kelas: kelas,
                    progress: progress,
                    recent_modul: user_class[0].recent_modul,
                }
              });
            response.code(200);
            return response
        }
        else{
            const response = h.response({
                status: 'success',
                message: 'maaf anda belum memiliki kelas',
              });
            response.code(200);
            return response
        }
    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

module.exports.classes = async function(request,h){
    try {
        const{userid} = request.payload;

        
    } catch (error) {
        
    }
}

module.exports.profil = async function(request,h){
    try {
        const{userid} = request.payload;
        const user_profil = await con.query('SELECT users.*, SUM(CASE progress.status WHEN "0" THEN 1 ELSE 0 END) as progress,SUM(CASE progress.status WHEN "1" THEN 1 ELSE 0 END) as finish FROM users INNER JOIN progress on users.id_user = progress.users_id WHERE users.id_user = '+userid+'');

        const response = h.response({
            status: 'success',
            data: user_profil
          });
          response.code(201);
          return response

    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

module.exports.moduleContent = async function(request,h){
    try {
        const{class_id,module_id} = request.payload;
        const next_module = parseInt(module_id)+1;
        const [result] = await con.query('SELECT * FROM `moduls` WHERE classes_id='+class_id+' and id_moduls='+module_id+'');
        const response = h.response({
            status: 'success',
            data: {
                module: result,
                nextModule: next_module,
                class_id: class_id
            }
          });
          response.code(201);
          return response
    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

//tambahan
module.exports.detail_kelas = async function (request, h) {
    try {
        const {id} = request.params;
        const [hasil] = await con.query('Select id_class, title, detail, picture, total_module from classes where id_class = '+id+'');
        let title = (hasil[0].title);
        let detail = (hasil[0].detail);
        let picture = (hasil[0].picture);
        if( hasil.length > 0) {
            const [modul] = await con.query('SELECT title FROM moduls WHERE EXISTS(SELECT id_class FROM classes WHERE classes.id_class = moduls.classes_id AND moduls.classes_id = '+id+');');
            const response= h.response({
                status: 'success',
                data: {
                    judul: title,
                    detail_kelas: detail,
                    picture: picture,
                    listmodul: modul,
                    jumlahmodul: modul.length
                }
            });
            response.code (201);
            return response
            } 
            else{
                const response = h.response({
                    status: '',
                    message: 'maaf kelas tidak ditemukan',
                  });
                response.code(201);
                return response
        } 
    }   catch (error) {
            console.log (error);
            const response = h.response({
                status: 'success',
                message: 'maaf terdapat masalah dengan koneksi',
              });
            response.code(500);
            return response
        }   
} 

module.exports.forum = async function (request, h) {
    try {
        const {id} = request.params;
        const [forum] = await con.query('SELECT title, question, time FROM forum WHERE EXISTS(SELECT id_class FROM classes WHERE classes.id_class = forum.classes_id AND forum.classes_id = '+id+') AND EXISTS(SELECT id_user FROM users WHERE users.id_user = forum.users_id)');
        if (forum.length > 0) {
            const response = h.response ({
                status: 'success',
                data: {
                    listforum: forum,
                }
            });
            response.code(201);
                return response
        }
        else {
            const response = h.response({
                status: 'success',
                message: 'belum ada diskusi'
            });
            response.code(201);
            return response
        }
    }
    catch(error) {
        console.log (error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}

module.exports.informasi_gizi = async function (request, h) {
    try {
        const {id} = request.params;
        const [hasil] = await con.query('SELECT name, content, benefit FROM informations WHERE EXISTS(SELECT id_class FROM classes WHERE classes.id_class = informations.classes_id AND informations.classes_id = '+id+')');
        if( hasil.length > 0) {
            let name = hasil[0].name;
            let content = hasil[0].content;
            let benefit = hasil[0].benefit;
            const response= h.response({
                status: 'success',
                data: {
                    judul: name,
                    kandungan: content,
                    manfaat: benefit
                }
            });
            response.code (201);
            return response
            } 
            else{
                const response = h.response({
                    status: 'fail',
                    message: 'maaf informasi tidak ditemukan',
                  });
                response.code(404);
                return response
        } 
    } 
    catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}
