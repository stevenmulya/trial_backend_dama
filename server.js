require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const storage = supabase.storage;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Multer Configuration
const upload = multer({ storage: multer.memoryStorage() });

// Fungsi untuk mengunggah MyPortofolio ke Supabase Storage
async function uploadMyPortofolioToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('myportofoliobucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/myportofoliobucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// Fungsi untuk mengunggah MyServices ke Supabase Storage
async function uploadMyServicesToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('myservicesbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/myservicesbucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// Fungsi untuk mengunggah MyBlog ke Supabase Storage
async function uploadMyBlogToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('myblogbucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/myblogbucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// Fungsi untuk mengunggah file ke Supabase Storage
async function uploadFileToSupabase(file, filePath) {
    try {
        const { error, data } = await storage
            .from('myhomebucket')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error('Supabase Storage Error:', error);
            return null;
        }

        return `${supabaseUrl}/storage/v1/object/public/myhomebucket/${filePath}`;
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return null;
    }
}

// --------------------- TAGLINE CRUD ---------------------

// Create a tagline (with image upload)
app.post('/taglines', upload.single('tagline_image'), async (req, res) => {
    try {
        const { tagline_title, tagline_subtitle } = req.body;

        let tagline_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            tagline_image = await uploadFileToSupabase(req.file, filePath, 'taglines');
            if (!tagline_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('taglines')
            .insert([{ tagline_image, tagline_title, tagline_subtitle }])
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
    const { data, error } = await supabase.from('taglines').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single tagline
app.get('/taglines/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('taglines').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a tagline (with image upload)
app.put('/taglines/:id', upload.single('tagline_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { tagline_title, tagline_subtitle } = req.body;

        let updateData = { tagline_title, tagline_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const tagline_image = await uploadFileToSupabase(req.file, filePath, 'taglines');
            if (!tagline_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.tagline_image = tagline_image;
        }

        const { data, error } = await supabase
            .from('taglines')
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
    const { id } = req.params;
    const { data, error } = await supabase.from('taglines').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Tagline deleted', data });
});

// --------------------- TOSERVICE CRUD ---------------------

// Create a toservice (with image upload)
app.post('/toservices', upload.single('toservice_image'), async (req, res) => {
    try {
        const { toservice_subtitle } = req.body;

        let toservice_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toservice_image = await uploadFileToSupabase(req.file, filePath, 'toservices');
            if (!toservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toservices')
            .insert([{ toservice_image, toservice_subtitle }])
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
    const { data, error } = await supabase.from('toservices').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single toservice
app.get('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a toservice (with image upload)
app.put('/toservices/:id', upload.single('toservice_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toservice_subtitle } = req.body;

        let updateData = { toservice_subtitle };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toservice_image = await uploadFileToSupabase(req.file, filePath, 'toservices');
            if (!toservice_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.toservice_image = toservice_image;
        }

        const { data, error } = await supabase
            .from('toservices')
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

// Delete a toservice
app.delete('/toservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toservices').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'ToService deleted', data });
});

// --------------------- CLIENTLOGOS CRUD ---------------------

// Create a clientlogo (with image upload)
app.post('/clientlogos', upload.single('clientlogo_image'), async (req, res) => {
    try {
        const { clientlogo_name, clientlogo_link } = req.body;

        let clientlogo_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            clientlogo_image = await uploadFileToSupabase(req.file, filePath, 'clientlogos');
            if (!clientlogo_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('clientlogos')
            .insert([{ clientlogo_image, clientlogo_name, clientlogo_link }])
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
    const { data, error } = await supabase.from('clientlogos').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single clientlogo
app.get('/clientlogos/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('clientlogos').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a clientlogo (with image upload)
app.put('/clientlogos/:id', upload.single('clientlogo_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { clientlogo_name, clientlogo_link } = req.body;

        let updateData = { clientlogo_name, clientlogo_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const clientlogo_image = await uploadFileToSupabase(req.file, filePath, 'clientlogos');
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
    const { id } = req.params;
    const { data, error } = await supabase.from('clientlogos').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'ClientLogo deleted', data });
});

// --------------------- TESTIMONIAL CRUD ---------------------

// Create a testimonial (with image upload)
app.post('/testimonials', upload.single('testimonial_image'), async (req, res) => {
    try {
        const { testimonial_text, testimonial_name } = req.body;

        let testimonial_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            testimonial_image = await uploadFileToSupabase(req.file, filePath, 'testimonials');
            if (!testimonial_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('testimonials')
            .insert([{ testimonial_image, testimonial_text, testimonial_name }])
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
    const { data, error } = await supabase.from('testimonials').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single testimonial
app.get('/testimonials/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a testimonial (with image upload)
app.put('/testimonials/:id', upload.single('testimonial_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { testimonial_text, testimonial_name } = req.body;

        let updateData = { testimonial_text, testimonial_name };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const testimonial_image = await uploadFileToSupabase(req.file, filePath, 'testimonials');
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
    const { id } = req.params;
    const { data, error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Testimonial deleted', data });
});

// --------------------- TOINSTAGRAM CRUD ---------------------

// Create a toinstagram (with image upload)
app.post('/toinstagrams', upload.single('toinstagram_image'), async (req, res) => {
    try {
        const { toinstagram_name, toinstagram_link } = req.body;

        let toinstagram_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            toinstagram_image = await uploadFileToSupabase(req.file, filePath, 'toinstagrams');
            if (!toinstagram_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('toinstagrams')
            .insert([{ toinstagram_image, toinstagram_name, toinstagram_link }])
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
    const { data, error } = await supabase.from('toinstagrams').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single toinstagram
app.get('/toinstagrams/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('toinstagrams').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a toinstagram (with image upload)
app.put('/toinstagrams/:id', upload.single('toinstagram_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { toinstagram_name, toinstagram_link } = req.body;

        let updateData = { toinstagram_name, toinstagram_link };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const toinstagram_image = await uploadFileToSupabase(req.file, filePath, 'toinstagrams');
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
    const { id } = req.params;
    const { data, error } = await supabase.from('toinstagrams').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'ToInstagram deleted', data });
});

// --------------------- MYSERVICES CRUD ---------------------

// Create a myservice (with image upload)
app.post('/myservices', upload.single('myservice_image'), async (req, res) => {
    try {
        const { myservice_name, myservice_description, myservice_type } = req.body;

        let myservice_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            myservice_image = await uploadMyServicesToSupabase(req.file, filePath);
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
    const { data, error } = await supabase.from('myservices').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single myservice
app.get('/myservices/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('myservices').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a myservice (with image upload)
app.put('/myservices/:id', upload.single('myservice_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { myservice_name, myservice_description, myservice_type } = req.body;

        let updateData = { myservice_name, myservice_description, myservice_type };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const myservice_image = await uploadMyServicesToSupabase(req.file, filePath);
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
    const { id } = req.params;
    const { data, error } = await supabase.from('myservices').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'myservice deleted', data });
});


// --------------------- MYPORTFOLIOS CRUD ---------------------

// Create a myportofolio (with image upload)
app.post('/myportofolios', upload.single('myportofolio_image'), async (req, res) => {
    try {
        const { myportofolio_name, myportofolio_description, myportofolio_date } = req.body;

        let myportofolio_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            myportofolio_image = await uploadMyPortofolioToSupabase(req.file, filePath);
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
    const { data, error } = await supabase.from('myportofolios').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single myportofolio
app.get('/myportofolios/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('myportofolios').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a myportofolio (with image upload)
app.put('/myportofolios/:id', upload.single('myportofolio_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { myportofolio_name, myportofolio_description, myportofolio_date } = req.body;

        let updateData = { myportofolio_name, myportofolio_description, myportofolio_date };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const myportofolio_image = await uploadMyPortofolioToSupabase(req.file, filePath);
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
    const { id } = req.params;
    const { data, error } = await supabase.from('myportofolios').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'myportofolio deleted', data });
});

// --------------------- MYBLOG CRUD ---------------------

// Create a blog post (with image upload)
app.post('/myblogs', upload.single('myblog_image'), async (req, res) => {
    try {
        const { myblog_title, myblog_content, myblog_date } = req.body;

        let myblog_image = null;
        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            myblog_image = await uploadMyBlogToSupabase(req.file, filePath);
            if (!myblog_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        }

        const { data, error } = await supabase
            .from('myblogs')
            .insert([{ myblog_title, myblog_image, myblog_content, myblog_date }])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all blog posts
app.get('/myblogs', async (req, res) => {
    const { data, error } = await supabase.from('myblogs').select('*');

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Get a single blog post
app.get('/myblogs/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('myblogs').select('*').eq('id', id).single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json(data);
});

// Update a blog post (with image upload)
app.put('/myblogs/:id', upload.single('myblog_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { myblog_title, myblog_content, myblog_date } = req.body;

        let updateData = { myblog_title, myblog_content, myblog_date };

        if (req.file) {
            const filePath = `${Date.now()}${path.extname(req.file.originalname)}`;
            const myblog_image = await uploadMyBlogToSupabase(req.file, filePath);
            if (!myblog_image) {
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            updateData.myblog_image = myblog_image;
        }

        const { data, error } = await supabase
            .from('myblogs')
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

// Delete a blog post
app.delete('/myblogs/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('myblogs').delete().eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Blog post deleted', data });
});

// --------------------- START SERVER ---------------------

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});