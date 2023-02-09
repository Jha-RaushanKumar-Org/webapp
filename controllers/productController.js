const conn = require('../database');
const hashPassword = require('../utils');
const bcrypt = require('bcrypt');

const basicAuthentication = require('../utils');
const comparePasswords = require('../utils');


exports.createProduct = async function (req, res) {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json("Request Unauthorized");
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }

    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?', [username], async (err, response) => {
        if (response[0].cnt == 0) {
            return res.status(401).json("Invalid Authentication");
        } else {
            conn.query('SELECT * FROM users WHERE username = ?', [username], async (err, response) => {
                const passauthentication = await bcrypt.compare(password, response[0].password);
                if (!passauthentication) {
                    return res.status(401).json("Invalid Authentication");
                } else {
                    let reqBody;
                    if (req.body) {
                        reqBody = Object.keys(req.body);
                    } else {
                        reqBody = null;
                    }

                    if (Object.keys(req.body).length === 0) {
                        return res.status(400).json('No Product created');
                    }
                    const name = req.body.name;
                    const description = req.body.description;
                    const sku = req.body.sku;
                    const manufacturer = req.body.manufacturer;
                    const quantity = req.body.quantity;
                    const date_added = new Date().toISOString();
                    const date_last_updated = new Date().toISOString();
                    var owner_user_id
                    conn.query('SELECT id as id FROM users WHERE username = ?', [username], async (err, response) => {
                        owner_user_id = response[0].id;
                    });

                    if (!name || !description || !sku || !manufacturer || !quantity) {
                        return res.status(400).json("Data Incomplete");
                    }
                    if (quantity < 0) {
                        return res.status(400).json('Quantity should be positive.');
                    }
                    if (quantity > 100) {
                        return res.status(400).json('Quantity should be max 100.');
                    }
                    if (isString(quantity)) {
                        return res.status(400).json('Quantity should be integer.');
                    }
                    if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                        return res.status(400).json("Enter only name, description, sku, manufacturer and quantity");
                    }
                    conn.query('SELECT count(*) AS cnt FROM product WHERE sku = ?', [req.body.sku], (err, response) => {
                        if (response[0].cnt != 0) {
                            return res.status(400).json("Product with same sku already exists. Enter new sku");
                        } else {
                            conn.query('INSERT INTO product VALUES (null,?,?,?,?,?,?,?,?)', [name, description, sku, manufacturer, quantity, date_added, date_last_updated, owner_user_id], (error, result) => {
                                if (error) {
                                    console.log(error);
                                    return res.status(400).json("Error creating product in Database.");
                                } else {
                                    conn.query('SELECT * FROM product WHERE sku = ?', [sku], async (err, response) => {
                                        return res.status(201).json(response[0]);
                                    });

                                }
                            });
                        }
                    });
                }

            });
        }
    });

}

function isString(input) {
    return typeof input === 'string' && Object.prototype.toString.call(input) === '[object String]'
}

exports.getProduct = async function (req, res) {

    conn.query('SELECT count(*) as cnt FROM product WHERE id = ?', [req.params.id], async (err, response) => {
        if (response[0].cnt == 0) {
            return res.status(404).json("Product not found");
        } else {
            conn.query('SELECT * FROM product WHERE id = ?', [req.params.id], async (err, response) => {
                return res.status(200).json(response);
            });
        }
    });


}

exports.deleteProduct = async function (req, res) {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json("Request Unauthorized");
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }

    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?', [username], async (err, response) => {
        if (response[0].cnt == 0) {
            return res.status(401).json("Invalid Authentication");
        } else {
            conn.query('SELECT * FROM users WHERE username = ?', [username], async (err, response) => {
                const passauthentication = await bcrypt.compare(password, response[0].password);
                if (!passauthentication) {
                    return res.status(401).json("Invalid Authentication");
                } else {

                    conn.query('SELECT count(*) as cnt1 FROM product WHERE owner_user_id = ? and id = ?', [response[0].id, req.params.id], async (err, response1) => {
                        if (response1[0].cnt1 == 0) {
                            conn.query('SELECT count(*) as cnt FROM product WHERE id = ?', [req.params.id], (error, result) => {
                                if (result[0].cnt == 0) {
                                    return res.status(404).json("Product doesn't exists");
                                } else {
                                    return res.status(403).json("Forbidden");
                                }
                            });
                        } else {
                            conn.query('DELETE FROM product WHERE id = ?', [req.params.id], (error, result) => {
                                if (error) {
                                    console.log(error);
                                    return res.status(400).json("Error deleting user in Database.");
                                } else {
                                    return res.status(204).json('Product successfully deleted');

                                }
                            });
                        }
                    });

                }
            });


        }
    });

}

exports.updateProduct = async function (req, res) {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json("Request Unauthorized");
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }

    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?', [username], async (err, response) => {
        if (response[0].cnt == 0) {
            return res.status(401).json("Invalid Authentication");
        } else {
            conn.query('SELECT * FROM users WHERE username = ?', [username], async (err, response) => {
                const passauthentication = await bcrypt.compare(password, response[0].password);
                if (!passauthentication) {
                    return res.status(401).json("Invalid Authentication");
                } else {

                    conn.query('SELECT count(*) as cnt1 FROM product WHERE owner_user_id = ? and id = ?', [response[0].id, req.params.id], async (err, response1) => {
                        if (response1[0].cnt1 == 0) {
                            conn.query('SELECT count(*) as cnt FROM product WHERE id = ?', [req.params.id], (error, result) => {
                                if (result[0].cnt == 0) {
                                    return res.status(404).json("Product doesn't exists");
                                } else {
                                    return res.status(403).json("Forbidden");
                                }
                            });
                        } else {
                            let reqBody;
                            if (req.body) {
                                reqBody = Object.keys(req.body);
                            } else {
                                reqBody = null;
                            }

                            if (Object.keys(req.body).length === 0) {
                                return res.status(400).json('No Product created');
                            }
                            
                            for (const key in req.body) {
                                if (key !== "name" || key != "description" || key != "sku" || key != "manufacturer" || key != "quantity") {
                                    return res.status(400).send({
                                        message: "bad request: invalid field in the body"
                                    })
                                }
                            }
                            const name = req.body.name;
                            const description = req.body.description;
                            const sku = req.body.sku;
                            const manufacturer = req.body.manufacturer;
                            const quantity = req.body.quantity;
                            const date_last_updated = new Date().toISOString();
                            var owner_user_id
                            conn.query('SELECT id as id FROM users WHERE username = ?', [username], async (err, response) => {
                                owner_user_id = response[0].id;
                            });

                            if (!name || !description || !sku || !manufacturer || !quantity) {
                                return res.status(400).json("Data Incomplete");
                            }
                            if (quantity < 0) {
                                return res.status(400).json('Quantity should be positive.');
                            }
                            if (quantity > 100) {
                                return res.status(400).json('Quantity should be max 100.');
                            }
                            if (isString(quantity)) {
                                return res.status(400).json('Quantity should be integer.');
                            }
                            if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                                return res.status(400).json("Enter only name, description, sku, manufacturer and quantity");
                            }
                            conn.query('SELECT count(*) AS cnt FROM product WHERE sku = ? and id != ? ', [req.body.sku, req.params.id], (err, response) => {
                                if (response[0].cnt != 0) {
                                    return res.status(400).json("Product with same sku already exists. Enter new sku");
                                } else {
                                    conn.query('UPDATE product SET name = ?, description = ?,sku  = ?, manufacturer = ?, quantity = ?, date_last_updated = ? WHERE id = ?', [name, description, sku, manufacturer, quantity, date_last_updated, req.params.id], (error, result) => {
                                        if (error) {
                                            console.log(error);
                                            return res.status(400).json("Error updating product in Database.");
                                        } else {
                                            return res.status(204).json('Product successfully updated');

                                        }
                                    });
                                }
                            });

                        }
                    });

                }
            });
        }
    });

}

exports.updatePatchProduct = async function (req, res) {

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json("Request Unauthorized");
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');


    if (!username || !password) {
        return res.status(401).json("Invalid Authentication");
    }

    conn.query('SELECT count(*) as cnt FROM users WHERE username = ?', [username], async (err, response) => {
        if (response[0].cnt == 0) {
            return res.status(401).json("Invalid Authentication");
        } else {
            conn.query('SELECT * FROM users WHERE username = ?', [username], async (err, response) => {
                const passauthentication = await bcrypt.compare(password, response[0].password);
                if (!passauthentication) {
                    return res.status(401).json("Invalid Authentication");
                } else {

                    conn.query('SELECT count(*) as cnt1 FROM product WHERE owner_user_id = ? and id = ?', [response[0].id, req.params.id], async (err, response1) => {
                        if (response1[0].cnt1 == 0) {
                            conn.query('SELECT count(*) as cnt FROM product WHERE id = ?', [req.params.id], (error, result) => {
                                if (result[0].cnt == 0) {
                                    return res.status(404).json("Product doesn't exists");
                                } else {
                                    return res.status(403).json("Forbidden");
                                }
                            });
                        } else {
                            let reqBody;
                            if (req.body) {
                                reqBody = Object.keys(req.body);
                            } else {
                                reqBody = null;
                            }

                            if (Object.keys(req.body).length === 0) {
                                return res.status(400).json('No Product Updated');
                            }
                            var name = req.body.name;
                            var description = req.body.description;
                            var sku = req.body.sku;
                            var manufacturer = req.body.manufacturer;
                            var quantity = req.body.quantity;
                            var len = Object.keys(req.body).length;
                            const date_last_updated = new Date().toISOString();
                            if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                                return res.status(400).json("Enter only name, description, sku, manufacturer and quantity");
                            }
                            if (name) {
                                conn.query('UPDATE product SET name = ?, date_last_updated = ? WHERE id = ?', [name, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        len--;
                                        if (len == 0) {
                                            return res.status(204).json('Product successfully updated');
                                        }
                                    }

                                });
                            }
                            if (description) {
                                conn.query('UPDATE product SET description = ?, date_last_updated = ? WHERE id = ?', [description, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        len--;
                                        if (len == 0) {
                                            return res.status(204).json('Product successfully updated');
                                        }
                                    }
                                });
                            }
                            if (manufacturer) {
                                conn.query('UPDATE product SET manufacturer = ?, date_last_updated = ? WHERE id = ?', [manufacturer, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        len--;
                                        if (len == 0) {
                                            return res.status(204).json('Product successfully updated');
                                        }
                                    }
                                });
                            }
                            if (quantity) {
                                if (quantity < 0) {
                                    return res.status(400).json('Quantity should be positive.');
                                }
                                if (quantity > 100) {
                                    return res.status(400).json('Quantity should be max 100.');
                                }
                                if (isString(quantity)) {
                                    return res.status(400).json('Quantity should be integer.');
                                }
                                conn.query('UPDATE product SET quantity = ?, date_last_updated = ? WHERE id = ?', [quantity, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        len--;
                                        if (len == 0) {
                                            return res.status(204).json('Product successfully updated');
                                        }
                                    }
                                });
                            }

                            if (sku) {
                                conn.query('SELECT count(*) AS cnt FROM product WHERE sku = ? and id != ? ', [req.body.sku, req.params.id], (err, response) => {
                                    if (response[0].cnt != 0) {
                                        return res.status(400).json("Product with same sku already exists. Enter new sku");
                                    } else {
                                        conn.query('UPDATE product SET sku  = ?, date_last_updated = ? WHERE id = ?', [sku, date_last_updated, req.params.id], (error, result) => {
                                            if (error) {
                                                console.log(error);
                                                return res.status(400).json("Error updating product in Database.");
                                            } else {
                                                len--;
                                                if (len == 0) {
                                                    return res.status(204).json('Product successfully updated');
                                                }
                                            }
                                        });
                                    }

                                });
                            }


                            /*conn.query('SELECT * FROM product WHERE owner_user_id = ? and id = ? ', [response[0].id, req.params.id], (err, response2) => {
                                if(!name){
                                    conn.query('UPDATE product SET name = ?, date_last_updated = ? WHERE id = ?', [name, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        //return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        //return res.status(204).json('Product successfully updated');

                                    }
                                });
                                }
                                //console.log(response[0]);
                                //console.log(response2[0].name);
                                console.log(name);
                                    
                                
                                description = response2[0].description;
                                sku = response2[0].sku;
                                manufacturer = response2[0].manufacturer;
                                quantity = response2[0].quantity;
                                //const date_last_updated = new Date().toISOString();
                            });
                            console.log(name);
                            if(req.body.sku){
                                sku = req.body.sku;
                            }
                            if(req.body.manufacturer){
                                manufacturer = req.body.manufacturer;
                            }
                            if(req.body.quantity){
                                quantity = req.body.quantity;
                            }
                            //console.log(name);
                            var owner_user_id
                            conn.query('SELECT id as id FROM users WHERE username = ?', [username], async (err, response) => {
                                owner_user_id = response[0].id;
                            });
                            
                            
                            if (quantity && quantity < 0) {
                                return res.status(400).json('Quantity should be positive.');
                            }
                            if (quantity && quantity > 100) {
                                return res.status(400).json('Quantity should be max 100.');
                            }
                            if (quantity && isString(quantity)) {
                                return res.status(400).json('Quantity should be integer.');
                            }
                            if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                                return res.status(400).json("Enter only name, description, sku, manufacturer and quantity");
                            }
                            if(req.body.hasOwnProperty('sku')){
                                conn.query('SELECT count(*) AS cnt FROM product WHERE sku = ? and id != ? ', [req.body.sku, req.params.id], (err, response) => {
                                    if (response[0].cnt != 0) {
                                        return res.status(400).json("Product with same sku already exists. Enter new sku");
                                    } else {
                                        conn.query('UPDATE product SET name = ?, description = ?,sku  = ?, manufacturer = ?, quantity = ?, date_last_updated = ? WHERE id = ?', [name, description, sku, manufacturer, quantity, date_last_updated, req.params.id], (error, result) => {
                                            if (error) {
                                                console.log(error);
                                                return res.status(400).json("Error updating product in Database.");
                                            } else {
                                                return res.status(204).json('Product successfully updated');
    
                                            }
                                        });
                                    }
                                });
                            }
                            else{
                                conn.query('UPDATE product SET name = ?, description = ?,sku  = ?, manufacturer = ?, quantity = ?, date_last_updated = ? WHERE id = ?', [name, description, sku, manufacturer, quantity, date_last_updated, req.params.id], (error, result) => {
                                    if (error) {
                                        console.log(error);
                                        return res.status(400).json("Error updating product in Database.");
                                    } else {
                                        return res.status(204).json('Product successfully updated');

                                    }
                                });
                            }*/

                        }
                    });

                }
            });
        }
    });

}