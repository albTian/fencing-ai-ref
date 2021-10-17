# Copyright (c) 2019 wrnch Inc.
# All rights reserved

from wrcloud import wrcloud as wr
from wrcloud import exceptions as ex
from os import path


class API:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.wrapper = wr.wrCloud(username, password)

    def authenticate(self):
        self.wrapper.update_auth_token()

    # Calls submit AND save to fpath
    def submit_job(self, file_path, categories, options):
        job_id = self.wrapper.submit_job(file_path, categories, options)
        try:
            if self.processed(job_id):
                self.save_response(job_id, file_path)
            else:
                raise Exception("Job #{} processing has failed".format(job_id))
            return False, job_id
        except AssertionError:  # Timeout
            return True, job_id

    def processed(self, job_id):
        self.wrapper.wait_for_processed_job(job_id, interval=3, timeout=9)
        return self.wrapper.is_job_successful(job_id)

    # Saves to fpath
    def save_response(self, job_id, fpath):
        fpath = path.split(fpath)
        out_path = fpath
        resp = self.wrapper.get_job_details(job_id)
        work_types = resp['work_types']
        for work_type in work_types:
            out_path = path.join(fpath[0], "{}-{}".format(work_type, fpath[1]))
            self.wrapper.download_job(job_id, out_path, work_type)

    def _is_zipped(self, job_id):
        try:
            resp = self.wrapper.get_job_details(job_id)
            work_types = resp['work_types']
            return len(work_types) > 1
        except BaseException:
            return False
