import json


class RoutrConfig(object):
    """
    The config object for routr.
    Loads a json file and makes it available for the app.
    """

    def __init__(self, filename):
        self.filename = filename
        self.error = False
        self.configs = {}

        with open(filename) as json_data:
            try:
                d = json.load(json_data)
            except:
                print("Error loading json config file.")
                self.error = True
                return
            json_data.close()

            self.data = d

            self.data_retrieval_pwd = d.get("data_retrieval_pwd")
            self.qgis_server_address = d.get("qgis").get("server_address")
            self.development = d.get("development")
            self.configs_ids = d.get("configs")

            for config_id in self.configs_ids:
                self.configs[config_id] = d.get(config_id)

    def get_config(self, id=''):
        return self.configs.get(id)

    def get_first_config(self):
        import pdb;pdb.set_trace()
        return self.configs[self.configs.keys[0]]