import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const getTemplates = async () => {
    try {
        const res = await axios.get(`${API_BASE}/templates`);
        return res.data;
    } catch (err) {
        console.error("Error fetching templates:", err);
        return [];
    }
};

export const deployTemplate = async (appName, templateId = null, githubUrl = null) => {
    try {
        const res = await axios.post(`${API_BASE}/deploy/template`, {
            app_name: appName,
            template_id: templateId,
            github_url: githubUrl
        });
        return res.data;
    } catch (err) {
        console.error("Deployment error:", err);
        throw err;
    }
};
