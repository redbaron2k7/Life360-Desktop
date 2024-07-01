    import React, { useState, useEffect } from 'react';
    import ReactDOM from 'react-dom';
    const { ipcRenderer } = window.require('electron');

    const initialHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Origin': 'https://app.life360.com',
    'Referer': 'https://app.life360.com/',
    'User-Agent': 'com.life360.android.safetymapd/KOKO version: 23.49.0 android XX:XX:XX:XX:XX:XX',
    'X-Device-ID': 'XX:XX:XX:XX:XX:XX',
    };

    function DevPanel({ isOpen, onClose }) {
    const [method, setMethod] = useState('GET');
    const [endpoint, setEndpoint] = useState('');
    const [useAuth, setUseAuth] = useState(true);
    const [headers, setHeaders] = useState(initialHeaders);
    const [newHeaderKey, setNewHeaderKey] = useState('');
    const [newHeaderValue, setNewHeaderValue] = useState('');
    const [response, setResponse] = useState(null);
    const [requestBody, setRequestBody] = useState('');

    const handleHeaderChange = (key, value) => {
        setHeaders(prev => ({ ...prev, [key]: value }));
    };

    const handleHeaderRemove = (key) => {
        setHeaders(prev => {
        const newHeaders = { ...prev };
        delete newHeaders[key];
        return newHeaders;
        });
    };

    const handleAddHeader = () => {
        if (newHeaderKey && newHeaderValue) {
        setHeaders(prev => ({ ...prev, [newHeaderKey]: newHeaderValue }));
        setNewHeaderKey('');
        setNewHeaderValue('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const result = await ipcRenderer.invoke('dev-custom-request', {
            method,
            path: endpoint,
            data: method !== 'GET' ? JSON.parse(requestBody) : null,
            useAuth,
            customHeaders: headers,
        });
        setResponse(JSON.stringify(result, null, 2));
        } catch (error) {
        setResponse(`Error: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Developer Panel</h2>
            <button onClick={onClose} className="text-2xl">&times;</button>
            </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-4">
            <div className="w-1/4">
                <label className="block mb-1">Method:</label>
                <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
                >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                </select>
            </div>
            <div className="w-3/4">
                <label className="block mb-1">Endpoint:</label>
                <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
                placeholder="/v3/circles"
                />
            </div>
            </div>
            <div>
            <label className="flex items-center">
                <input
                type="checkbox"
                checked={useAuth}
                onChange={(e) => setUseAuth(e.target.checked)}
                className="mr-2"
                />
                Use Authentication
            </label>
            </div>
            <div>
            <label className="block mb-1">Headers:</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex space-x-2">
                    <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                        const newHeaders = { ...headers };
                        delete newHeaders[key];
                        newHeaders[e.target.value] = value;
                        setHeaders(newHeaders);
                    }}
                    className="w-1/3 p-2 bg-gray-700 rounded"
                    />
                    <input
                    type="text"
                    value={value}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    className="w-1/2 p-2 bg-gray-700 rounded"
                    />
                    <button
                    type="button"
                    onClick={() => handleHeaderRemove(key)}
                    className="w-1/6 bg-red-500 rounded p-2"
                    >
                    Remove
                    </button>
                </div>
                ))}
            </div>
            <div className="flex space-x-2 mt-2">
                <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="New header key"
                className="w-1/3 p-2 bg-gray-700 rounded"
                />
                <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                placeholder="New header value"
                className="w-1/2 p-2 bg-gray-700 rounded"
                />
                <button
                type="button"
                onClick={handleAddHeader}
                className="w-1/6 bg-green-500 rounded p-2"
                >
                Add
                </button>
            </div>
            </div>
            {method !== 'GET' && (
            <div>
                <label className="block mb-1">Request Body (JSON):</label>
                <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
                rows="4"
                />
            </div>
            )}
            <button type="submit" className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 transition-colors">
            Send Request
            </button>
        </form>
            {response && (
            <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Response:</h3>
                <pre className="bg-gray-700 p-4 rounded overflow-auto max-h-60">{response}</pre>
            </div>
            )}
        </div>
        </div>,
        document.body
    );
    }

    export default DevPanel;