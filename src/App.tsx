import React, { useState, useEffect } from 'react';

const App = () => {
    const [data, setData] = useState({
        research: '',
        architecture: '',
        performance: '',
        load_test: '',
        script: '',
        diagnostics: '',
        utilities: '',
        browser: ''
    });

    const [unsavedChanges, setUnsavedChanges] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            setData(JSON.parse(savedData));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('appData', JSON.stringify(data));
    }, [data]);

    const handleChange = (module, value) => {
        setData(prevData => {
            setUnsavedChanges(true);
            return { ...prevData, [module]: value };
        });
    };

    const handleSave = () => {
        setUnsavedChanges(false);
        alert('Data saved successfully!');
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1>Engineering Modules</h1>
            { Object.keys(data).map(module => (
                <div key={module}>
                    <label>{module.charAt(0).toUpperCase() + module.slice(1)}:</label>
                    <textarea
                        value={data[module]}
                        onChange={(e) => handleChange(module, e.target.value)}
                    />
                </div>
            ))}
            <button onClick={handleSave} disabled={!unsavedChanges}>Save Changes</button>
            <button onClick={handleExport}>Export Data</button>
        </div>
    );
};

export default App;
