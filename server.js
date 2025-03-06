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

async function uploadFileToSupabase(file, filePath) {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            throw error;
        }
        return supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
    } catch (error) {
        console.error("Supabase Upload Error:", error);
        return null;
    }
}

// --------------------- TAGLINES CRUD ---------------------

// Create a tagline (with image upload)
app.post('/taglines', upload.single('tagline_image'), async (req, res) => {
    try {
        const { tagline_title, tagline_subtitle } = req.body;

        let tagline_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            tagline_image = await uploadFileToSupabase(req.file, filePath);
            if (!tagline_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('tagline')
            .insert([{ tagline_title, tagline_image, tagline_subtitle }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all taglines
app.get('/taglines', async (req, res) => {
    try{
        const { data, error } = await supabase.from('tagline').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get a single tagline
app.get('/taglines/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('tagline').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Update a tagline (with image upload)
app.put('/taglines/:id', upload.single('tagline_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { tagline_title, tagline_subtitle } = req.body;

        let updateData = { tagline_title, tagline_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const tagline_image = await uploadFileToSupabase(req.file, filePath);
            if (!tagline_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.tagline_image = tagline_image;
        }

        const { data, error } = await supabase
            .from('tagline')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a tagline
app.delete('/taglines/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('tagline').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Tagline deleted', data });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// --------------------- TOSERVICES CRUD (No Delete) ---------------------

// Create a toservice (with image upload)
app.post('/toservices', upload.single('toservice_image'), async (req, res) => {
    try {
        const { toservice_subtitle } = req.body;

        let toservice_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toservice_image = await uploadFileToSupabase(req.file, filePath);
            if (!toservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toservice')
            .insert([{ toservice_subtitle, toservice_image }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all toservices
app.get('/toservices', async (req, res) => {
    try {
        const { data, error } = await supabase.from('toservice').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single toservice
app.get('/toservices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('toservice').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a toservice (with image upload)
app.put('/toservices/:id', upload.single('toservice_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toservice_subtitle } = req.body;

        let updateData = { toservice_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toservice_image = await uploadFileToSupabase(req.file, filePath);
            if (!toservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.toservice_image = toservice_image;
        }

        const { data, error } = await supabase
            .from('toservice')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- CLIENTLOGOS CRUD ---------------------

// Create a clientlogo (with image upload)
app.post('/clientlogos', upload.single('clientlogo_image'), async (req, res) => {
    try {
        const { clientlogo_name, clientlogo_link } = req.body;

        let clientlogo_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            clientlogo_image = await uploadFileToSupabase(req.file, filePath);
            if (!clientlogo_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('clientlogos')
            .insert([{ clientlogo_name, clientlogo_image, clientlogo_link }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all clientlogos
app.get('/clientlogos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('clientlogos').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single clientlogo
app.get('/clientlogos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('clientlogos').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a clientlogo (with image upload)
app.put('/clientlogos/:id', upload.single('clientlogo_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { clientlogo_name, clientlogo_link } = req.body;

        let updateData = { clientlogo_name, clientlogo_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const clientlogo_image = await uploadFileToSupabase(req.file, filePath);
            if (!clientlogo_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.clientlogo_image = clientlogo_image;
        }

        const { data, error } = await supabase
            .from('clientlogos')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a clientlogo
app.delete('/clientlogos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('clientlogos').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Clientlogo deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- TESTIMONIALS CRUD ---------------------

// Create a testimonial (with image upload)
app.post('/testimonials', upload.single('testimonial_image'), async (req, res) => {
    try {
        const { testimonial_text, testimonial_name } = req.body;

        let testimonial_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            testimonial_image = await uploadFileToSupabase(req.file, filePath);
            if (!testimonial_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('testimonials')
            .insert([{ testimonial_text, testimonial_image, testimonial_name }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all testimonials
app.get('/testimonials', async (req, res) => {
    try {
        const { data, error } = await supabase.from('testimonials').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single testimonial
app.get('/testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a testimonial (with image upload)
app.put('/testimonials/:id', upload.single('testimonial_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { testimonial_text, testimonial_name } = req.body;

        let updateData = { testimonial_text, testimonial_name };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const testimonial_image = await uploadFileToSupabase(req.file, filePath);
            if (!testimonial_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.testimonial_image = testimonial_image;
        }

        const { data, error } = await supabase
            .from('testimonials')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a testimonial
app.delete('/testimonials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('testimonials').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Testimonial deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- TOINSTAGRAMS CRUD ---------------------

// Create a toinstagram (with image upload)
app.post('/toinstagrams', upload.single('toinstagram_image'), async (req, res) => {
    try {
        const { toinstagram_name, toinstagram_link } = req.body;

        let toinstagram_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toinstagram_image = await uploadFileToSupabase(req.file, filePath);
            if (!toinstagram_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toinstagrams')
            .insert([{ toinstagram_name, toinstagram_image, toinstagram_link }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all toinstagrams
app.get('/toinstagrams', async (req, res) => {
    try {
        const { data, error } = await supabase.from('toinstagrams').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single toinstagram
app.get('/toinstagrams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('toinstagrams').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a toinstagram (with image upload)
app.put('/toinstagrams/:id', upload.single('toinstagram_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toinstagram_name, toinstagram_link } = req.body;

        let updateData = { toinstagram_name, toinstagram_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toinstagram_image = await uploadFileToSupabase(req.file, filePath);
            if (!toinstagram_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.toinstagram_image = toinstagram_image;
        }

        const { data, error } = await supabase
            .from('toinstagrams')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a toinstagram
app.delete('/toinstagrams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('toinstagrams').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Toinstagram deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- MYSERVICES CRUD ---------------------

// Create a myservice (with image upload)
app.post('/myservices', upload.single('myservice_image'), async (req, res) => {
    try {
        const { myservice_name, myservice_description, myservice_type } = req.body;

        let myservice_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            myservice_image = await uploadFileToSupabase(req.file, filePath);
            if (!myservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('myservices')
            .insert([{ myservice_name, myservice_image, myservice_description, myservice_type }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all myservices
app.get('/myservices', async (req, res) => {
    try {
        const { data, error } = await supabase.from('myservices').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single myservice
app.get('/myservices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myservices').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a myservice (with image upload)
app.put('/myservices/:id', upload.single('myservice_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { myservice_name, myservice_description, myservice_type } = req.body;

        let updateData = { myservice_name, myservice_description, myservice_type };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const myservice_image = await uploadFileToSupabase(req.file, filePath);
            if (!myservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.myservice_image = myservice_image;
        }

        const { data, error } = await supabase
            .from('myservices')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a myservice
app.delete('/myservices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myservices').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Myservice deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --------------------- MYPORTOFOLIOS CRUD ---------------------

// Create a myportofolio (with image upload)
app.post('/myportofolios', upload.single('myportofolio_image'), async (req, res) => {
    try {
        const { myportofolio_name, myportofolio_description, myportofolio_date } = req.body;

        let myportofolio_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            myportofolio_image = await uploadFileToSupabase(req.file, filePath);
            if (!myportofolio_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('myportofolios')
            .insert([{ myportofolio_name, myportofolio_image, myportofolio_description, myportofolio_date }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all myportofolios
app.get('/myportofolios', async (req, res) => {
    try {
        const { data, error } = await supabase.from('myportofolios').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single myportofolio
app.get('/myportofolios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myportofolios').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a myportofolio (with image upload)
app.put('/myportofolios/:id', upload.single('myportofolio_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { myportofolio_name, myportofolio_description, myportofolio_date } = req.body;

        let updateData = { myportofolio_name, myportofolio_description, myportofolio_date };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const myportofolio_image = await uploadFileToSupabase(req.file, filePath);
            if (!myportofolio_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.myportofolio_image = myportofolio_image;
        }

        const { data, error } = await supabase
            .from('myportofolios')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a myportofolio
app.delete('/myportofolios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myportofolios').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Myportofolio deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --------------------- MYBLOGS CRUD ---------------------

// Create a myblog
app.post('/myblogs', async (req, res) => {
    try {
        const { myblog_title, myblog_author, myblog_date, myblog_content } = req.body;

        const { data, error } = await supabase
            .from('myblogs')
            .insert([{ myblog_title, myblog_author, myblog_date, myblog_content }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all myblogs
app.get('/myblogs', async (req, res) => {
    try {
        const { data, error } = await supabase.from('myblogs').select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single myblog
app.get('/myblogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myblogs').select('*').eq('id', id).single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a myblog
app.put('/myblogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { myblog_title, myblog_author, myblog_date, myblog_content } = req.body;

        const { data, error } = await supabase
            .from('myblogs')
            .update({ myblog_title, myblog_author, myblog_date, myblog_content })
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a myblog
app.delete('/myblogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('myblogs').delete().eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Myblog deleted', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});