require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
    console.error("Supabase URL, Anon Key, or Service Key missing in .env file");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bucketName = 'damabucket';

async function uploadToSupabase(file, filename) {
    const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

    if (error) {
        throw error;
    }
    return supabaseAdmin.storage.from(bucketName).getPublicUrl(filename).data.publicUrl;
}

async function handleCRUD(tableName, req, res, uploadField = null, replaceExisting = false) {
    const body = req.body;
    let file = req.file;

    try {
        if (req.method === 'POST' || req.method === 'PUT') {
            if (uploadField && file) {
                const filename = Date.now() + path.extname(file.originalname);
                const imageUrl = await uploadToSupabase(file, filename);
                body[uploadField] = imageUrl;
            }

            if (replaceExisting) {
                const { error: deleteError } = await supabase.from(tableName).delete().neq('id', 0);
                if (deleteError) throw deleteError;
                const { data: insertData, error: insertError } = await supabase.from(tableName).insert([body]);
                if (insertError) throw insertError;
                res.json(insertData);
            } else {
                if (req.method === 'POST') {
                    const { data: insertData, error: insertError } = await supabase.from(tableName).insert([body]);
                    if (insertError) throw insertError;
                    res.json(insertData);
                } else {
                    const { id } = req.params;
                    const { data: updateResult, error: updateError } = await supabase.from(tableName).update(body).eq('id', id);
                    if (updateError) throw updateError;
                    res.json({ message: `${tableName} updated` });
                }
            }
        } else if (req.method === 'GET') {
            const { id } = req.params;
            if (id) {
                const { data: getData, error: getError } = await supabase.from(tableName).select('*').eq('id', id);
                if (getError) throw getError;
                if (!getData || getData.length === 0) return res.status(404).json({ message: `${tableName} not found` });
                res.json(getData[0]);
            } else {
                const { data: getAllData, error: getAllError } = await supabase.from(tableName).select('*');
                if (getAllError) throw getAllError;
                res.json(getAllData);
            }
        } else if (req.method === 'DELETE') {
            const { id } = req.params;
            const { data: deleteResult, error: deleteError } = await supabase.from(tableName).delete().eq('id', id);
            if (deleteError) throw deleteError;
            res.json({ message: `${tableName} deleted` });
        } else {
            res.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Routes using the generic function
app.post('/taglines', upload.single('tagline_image'), (req, res) => handleCRUD('tagline', req, res, 'tagline_image'));
app.get('/taglines', (req, res) => handleCRUD('tagline', req, res));
app.get('/taglines/:id', (req, res) => handleCRUD('tagline', req, res));
app.put('/taglines/:id', upload.single('tagline_image'), (req, res) => handleCRUD('tagline', req, res, 'tagline_image'));
app.delete('/taglines/:id', (req, res) => handleCRUD('tagline', req, res));

// toservices and testimonials: replace existing
app.post('/toservices', upload.single('toservice_image'), (req, res) => handleCRUD('toservice', req, res, 'toservice_image', true));
app.put('/toservices/replace', upload.single('toservice_image'), (req, res) => handleCRUD('toservice', req, res, 'toservice_image', true));
app.get('/toservices', (req, res) => handleCRUD('toservice', req, res));

app.post('/testimonials', upload.single('testimonial_image'), (req, res) => handleCRUD('testimonial', req, res, 'testimonial_image', true));
app.put('/testimonials/replace', upload.single('testimonial_image'), (req, res) => handleCRUD('testimonial', req, res, 'testimonial_image', true));
app.get('/testimonials', (req, res) => handleCRUD('testimonial', req, res));

app.post('/clientlogos', upload.single('clientlogo_image'), (req, res) => handleCRUD('clientlogo', req, res, 'clientlogo_image'));
app.get('/clientlogos', (req, res) => handleCRUD('clientlogo', req, res));
app.get('/clientlogos/:id', (req, res) => handleCRUD('clientlogo', req, res));
app.put('/clientlogos/:id', upload.single('clientlogo_image'), (req, res) => handleCRUD('clientlogo', req, res, 'clientlogo_image'));
app.delete('/clientlogos/:id', (req, res) => handleCRUD('clientlogo', req, res));

app.post('/toinstagrams', upload.single('toinstagram_image'), (req, res) => handleCRUD('toinstagram', req, res, 'toinstagram_image'));
app.get('/toinstagrams', (req, res) => handleCRUD('toinstagram', req, res));
app.get('/toinstagrams/:id', (req, res) => handleCRUD('toinstagram', req, res));
app.put('/toinstagrams/:id', upload.single('toinstagram_image'), (req, res) => handleCRUD('toinstagram', req, res, 'toinstagram_image'));
app.delete('/toinstagrams/:id', (req, res) => handleCRUD('toinstagram', req, res));

// New routes for myservice, myportofolio and myblog
app.post('/myservices', upload.single('myservice_image'), (req, res) => handleCRUD('myservice', req, res, 'myservice_image'));
app.get('/myservices', (req, res) => handleCRUD('myservice', req, res));
app.get('/myservices/:id', (req, res) => handleCRUD('myservice', req, res));
app.put('/myservices/:id', upload.single('myservice_image'), (req, res) => handleCRUD('myservice', req, res, 'myservice_image'));
app.delete('/myservices/:id', (req, res) => handleCRUD('myservice', req, res));

app.post('/myportofolios', upload.single('myportofolio_image'), (req, res) => handleCRUD('myportofolio', req, res, 'myportofolio_image'));
app.get('/myportofolios', (req, res) => handleCRUD('myportofolio', req, res));
app.get('/myportofolios/:id', (req, res) => handleCRUD('myportofolio', req, res));
app.put('/myportofolios/:id', upload.single('myportofolio_image'), (req, res) => handleCRUD('myportofolio', req, res, 'myportofolio_image'));
app.delete('/myportofolios/:id', (req, res) => handleCRUD('myportofolio', req, res));

app.post('/myblogs', (req, res) => handleCRUD('myblog', req, res));
app.get('/myblogs', (req, res) => handleCRUD('myblog', req, res));
app.get('/myblogs/:id', (req, res) => handleCRUD('myblog', req, res));
app.put('/myblogs/:id', (req, res) => handleCRUD('myblog', req, res));
app.delete('/myblogs/:id', (req, res) => handleCRUD('myblog', req, res));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});