const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors');

const app = express();
/*const port = 3000;*/

const port = process.env.PORT || 3000;

// Supabase client setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration

//const corsOptions = {
//    origin: 'http://localhost:3001', // Replace with your frontend URL
//    optionsSuccessStatus: 200
//};

const corsOptions = {
    origin: ['http://localhost:3001', 'https://your-frontend-url.vercel.app'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(email).toLowerCase());
};

// Route to get members with pagination
app.get('/members', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const sortColumn = req.query.sortColumn || 'name';
    const sortOrder = req.query.sortOrder || 'asc';

    try {
        let query = supabase.from('members').select('*', { count: 'exact' });

        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`);
        }

        query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

        const { count, error: countError } = await query.select('*', { count: 'exact', head: true });

        if (countError) {
            throw countError;
        }

        const { data, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        res.status(200).json({
            items: data,
            total: count,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get a specific member by ID
app.get('/members/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase.from('members').select('*').eq('id', id);
        if (error) {
            throw error;
        }
        if (data.length === 0) {
            res.status(404).json({ error: 'Member not found' });
        } else {
            res.status(200).json(data[0]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to add a new member
app.post('/members', async (req, res) => {
    // Validate and process request body
    try {
        const { name, username, avatar, is_active, role, email, teams } = req.body;

        // Set default avatar if not provided
        if (!avatar) {
            avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;
        }

        // Validation
        if (!name || !username || !role || !email || !teams || teams.length === 0) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Check if username or email already exists
        const { data: existingMember, error: checkError } = await supabase
            .from('members')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing member:', checkError);
            throw checkError;
        }

        if (existingMember) {
            return res.status(409).json({ error: 'A member with this username or email already exists.' });
        }

        // Proceed with insertion
        const newMember = { name, username, avatar, is_active, role, email, teams };
        const { data, error } = await supabase.from('members').insert([newMember]).select();

        if (error) {
            console.error('Error inserting new member:', error);
            throw error;
        }

        res.status(201).json(data[0]); // Return created member
    } catch (error) {
        console.error('Caught error:', error);
        res.status(500).json({ error: error.message });
    }
});



// Route to update an existing member by ID
app.put('/members/:id', async (req, res) => {
    const { id } = req.params;
    const { name, username, avatar, is_active, role, email, teams } = req.body;

    try {
        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Check if the member exists
        const { data: existingMember, error: fetchError } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        if (!existingMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Update the member
        const { data, error } = await supabase
            .from('members')
            .update({ name, username, avatar, is_active, role, email, teams })
            .eq('id', id);

        if (error) {
            console.error('Error updating member:', error);
            throw error;
        }

        res.status(200).json(data); // Return updated member
    } catch (error) {
        console.error('Caught error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Route to delete a member by ID
app.post('/members/delete', async (req, res) => {
    const { ids } = req.body;
    try {
        const { data, error } = await supabase
            .from('members')
            .delete()
            .in('id', ids);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Members deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
