# Copyright (c) 2019 wrnch Inc.
# All rights reserved

import sys
import os
import zipfile
from time import strftime, gmtime, sleep
import PIL.ImageTk
import PIL.Image
import cv2
import tkinter as tk
import tkinter.filedialog as tkFileDialog
from api import API
from visualizer import Visualizer

WEBCAM = sys.argv[1] if len(sys.argv) > 1 else 0


def truncate(string, cutoff=15):
    return (string[:cutoff] + '...') if len(string) > cutoff else string


class App:
    categories = {
        'annotated_media': 'Annotated Media',
        'fbx': 'FBX',
        'json': 'JSON'
    }
    category_targets = {
        'annotated_media': ['2D', 'heads', 'hands', 'greenscreen', 'tracking'],
        'fbx': [],
        'json': ['2D', 'heads', 'hands', 'est_3d']
    }
    options = {
        '2D': 'Add 2D Pose Estimation',  # JSON + Annotated Media
        'heads': 'Add Head Pose Estimation',  # JSON + Annotated Media
        'hands': 'Add Hand Pose Estimation',  # JSON + Annotated Media
        'greenscreen': 'Add Green Screen Estimation',  # Annotated Media
        'tracking': 'Enable Tracking',  # Annotated Media
        'est_3d': 'Add 3D Pose Estimation'  # JSON
    }
    success = "green"
    failure = "red"
    base = "black"
    dimensions = (640, 360)

    def __init__(self, window, window_title, video_source=WEBCAM):
        # Pages
        self.window = window
        self.window.configure(background='black')
        self.window.resizable(False, False)
        self.window.title(window_title)
        self.video_source = video_source

        self.main_page = tk.Frame(self.window)
        self.cam_window = tk.Toplevel(self.window)
        self.cam_window.resizable(False, False)
        self.cam_window.protocol(
            "WM_DELETE_WINDOW", lambda: self.toggle_cam(video_source))
        self.cam_page = tk.Frame(self.cam_window)
        self.main_page.grid()
        self.cam_page.grid()
        self.cam_window.withdraw()

        # Setup cam_page
        self.visualizer = None
        self.image_frame = tk.Frame(
            self.cam_page, width=App.dimensions[0], height=App.dimensions[1])
        self.image_frame.grid(row=0, column=0, columnspan=4,
                              rowspan=4, padx=10, pady=2)
        self.image_label = tk.Label(self.image_frame)
        self.image_label.grid(row=0, column=0)

        self.window.configure(width=App.dimensions[0])

        # Variables
        self.submissions = []
        self.indicators = []
        self.pending_jobs = {}  # Job_id: path
        self.file_path = None
        self.API = None
        self.delay = 15  # msec
        self._playback_job = None
        self._processing_job = None

        # ROW: #1 Credentials
        self.login_indicator = tk.Label(self.main_page, text="1")
        self.login_indicator.grid(row=1, column=0, padx=10, pady=10)
        self.username = tk.StringVar()
        self.password = tk.StringVar()

        tk.Label(self.main_page, text="Username").grid(row=1, column=1)
        self.username_entry = tk.Entry(
            self.main_page, textvariable=self.username)
        self.username_entry.grid(row=1, column=2)

        tk.Label(self.main_page, text="Password").grid(
            row=1, column=3, padx=10)
        self.password_entry = tk.Entry(
            self.main_page, textvariable=self.password, show='*')
        self.password_entry.grid(row=1, column=4)

        self.btn_session = tk.Button(
            self.main_page, text="Login", command=self.login)
        self.btn_session.grid(row=1, column=5, padx=10)

        # ROW: #2 File Selection + Webcam
        self.file_indicator = tk.Label(self.main_page, text="2")
        self.file_indicator.grid(row=2, column=0, pady=10)
        self.indicators.append(self.file_indicator)
        self.btn_cam = tk.Button(
            self.main_page, text="Camera", command=lambda webcam=self.video_source: self.toggle_cam(webcam))
        self.btn_cam.grid(row=2, column=1, sticky='ew', padx=10)

        self.btn_file = tk.Button(
            self.main_page, text="Select File", command=self.select_file)
        self.btn_file.grid(row=2, column=2, sticky='ew')

        tk.Label(self.main_page, text="File:").grid(
            row=2, column=3, padx=10, sticky='ew')
        self.fileLabel = tk.Label(self.main_page, text="", anchor="w")
        self.fileLabel.grid(row=2, column=4, columnspan=2,
                            sticky='ew', ipadx=10)

        # ROW: #3 + #4 Job Category and Options
        self.category_indicator = tk.Label(self.main_page, text="3")
        self.category_indicator.grid(row=3, column=0, pady=10)
        self.indicators.append(self.category_indicator)
        tk.Label(self.main_page, text="Job Category").grid(row=3, column=1)
        tk.Label(self.main_page, text="Job Options").grid(row=4, column=1)

        self.optionBar = Checkbar(self.main_page, App.options)
        self.categoryBar = Checkbar(
            self.main_page, App.categories, child=self.optionBar, targets=App.category_targets)
        self.categoryBar.grid(row=3, column=2, columnspan=3)
        self.optionBar.grid(row=4, column=2, columnspan=3)
        self.optionBar.grid_remove()

        # ROW: #5 Submit
        self.submit_indicator = tk.Label(self.main_page, text="4")
        self.submit_indicator.grid(row=5, column=0, pady=10)
        self.indicators.append(self.submit_indicator)
        self.btn_submit = tk.Button(
            self.main_page, text="Submit Job", command=self.submit)
        self.btn_submit.grid(row=5, column=2, columnspan=3, sticky='ew')
        self.btn_clear = tk.Button(
            self.main_page, text="Clear", command=self.clear)
        self.btn_clear.grid(row=5, column=5)

        # ROW: #6 Results
        self.result_frame = tk.Frame(self.main_page)
        self.result_frame.grid(
            row=6, column=1, columnspan=5, sticky='ew', pady=5, padx=10)
        self.result_field = ResultField(self.result_frame, self.toggle_cam)
        self.result_frame.grid_remove()

        # Webcam/Playback
        self.btn_snapshot = tk.Button(
            self.cam_page, text="Snapshot", command=self.snapshot)
        self.btn_snapshot.grid(
            row=4, column=0, columnspan=4, sticky='sew', padx=10)

        self.render_legend = tk.Label(
            self.cam_page, text="Base skeleton is rendered in blue while selected options are rendered in red")
        self.render_frame = tk.Frame(self.cam_page)
        self.render_frame.grid(row=6, column=0, columnspan=4, padx=10)
        self.render_legend.grid(row=5, column=0, columnspan=4, padx=10)
        self.render_options = {}
        col = 0
        for key in App.options:
            var = tk.IntVar()
            chk = tk.Checkbutton(self.render_frame, text=key, variable=var,
                                 command=lambda key=key: self._handle_render(key))
            chk.grid(row=0, column=col, padx=5)
            if key == '2D':
                var.set(1)
                chk.config(state="disabled")
            col += 1
            self.render_options.update({key: (chk, var)})
        campage_elements = [self.btn_snapshot,
                            self.render_frame, self.render_legend]
        for element in campage_elements:
            element.grid_remove()

        self.window.mainloop()

    def _handle_render(self, key):
        value = self.render_options[key][1]
        translation = Visualizer.TRANSLATION[key]
        if value.get() == 1:
            self.visualizer.selected_options.add(translation)
        else:
            self.visualizer.selected_options.discard(translation)
        self.visualizer.updated_options = True

    def _toggle_render(self, job_options):
        if self.render_frame.winfo_viewable():
            self.render_frame.grid_remove()
        else:
            self.render_frame.grid()
            for option in self.render_options:
                btn, val = self.render_options[option]
                if option in job_options and job_options[option]:
                    btn.grid()
                    val.set(1)
                    self._handle_render(option)
                else:
                    btn.grid_remove()
                    val.set(0)

    def toggle_cam(self, video_source, json_path=None, options=None, processed=False):
        if self.cam_window.winfo_viewable():
            self.cam_window.withdraw()
            self.visualizer.close_cam()
            campage_elements = [self.btn_snapshot,
                                self.render_frame, self.render_legend]
            for element in campage_elements:
                element.grid_remove()
            if self._playback_job is not None:
                self.window.after_cancel(self._playback_job)
                self._playback_job = None
        else:
            self.visualizer = Visualizer(video_source, json_path, processed)
            self.visualizer.open_cam()
            # 10 miliseconds spent during calculations
            self.delay = int(1000/self.visualizer.vid.get(cv2.CAP_PROP_FPS))-10
            if self.delay < 1:
                print(
                    "Note: Cannot reliably replay videos above 90 FPS. Playback will be at 60 FPS")
                self.delay = 15
            if video_source == self.video_source:
                self.cam_window.title("Webcam")
                self.btn_snapshot.grid()
            elif json_path is not None:
                self.cam_window.title("JSON Render")
                self.render_legend.grid()
                self._toggle_render(options)
            else:
                self.cam_window.title("Annotated Playback")
            if self._playback_job is None:
                self.update()
            self.cam_window.deiconify()

    def snapshot(self):
        file_name = 'Snapshot-{}.png'.format(
            strftime("%Y-%m-%d_%H:%M:%S", gmtime()))

        if self.visualizer.save_image(file_name):
            self.toggle_cam(self.video_source)  # close camera
            self.file_path = os.path.join(os.getcwd(), file_name)
            self.notify("Success", "Image saved to: {}".format(
                self.file_path), App.success, timeout=6000)
            self.fileLabel.configure(text="__CAMERA__")
            self.file_indicator.configure(fg=App.success)

            # Display saved image
            img = cv2.imread(self.file_path, 1)
            cv2.imshow("Saved Image", img)
            cv2.waitKey(500)
            self.window.after(6000, lambda: cv2.destroyWindow("Saved Image"))
        else:
            self.file_indicator.configure(fg=App.failure)

    def submit(self):
        try:
            # categories is a list []
            categories = self.categoryBar.get_selected()
            # params is a []
            params = {}
            for param in self.optionBar.get_selected():
                params.update({param: True})
            self.notify("Notice", "Submitting job")
            # SUBMITTING API JOB HERE
            print("ARGUMENTS FOR SUBMITTING: {0}, {1}, {2}".format(self.file_path, categories, params))
            
            timeout, job_id = self.API.submit_job(
                self.file_path, categories, params)
            self.submit_indicator.configure(fg=App.success)
            self.notify(
                "Success", "You have successfully submitted a job. \n It is now processing.", App.success)

            if timeout:
                self.notify(
                    "Notice", "Job is processing, results will be displayed when ready", timeout=20000)
                self.pending_jobs[job_id] = self.file_path
                if self._processing_job is None:
                    self._processing_job = self.window.after(
                        30000, self._get_results)
            else:
                self._display_result_frame()

            if job_id not in self.pending_jobs:
                self.result_field.populate(job_id, self.file_path)
            sleep(3)
            self.clear()
        except Exception as error:
            message = "You must login first" if self.API is None else str(
                error)
            self.submit_indicator.configure(fg=App.failure)
            self.notify("Error", message, status=App.failure)

    def _display_result_frame(self):
        if not self.result_frame.winfo_viewable():
            self.result_field.api = self.API
            self.result_field.pack(fill="both", expand=True)
            self.result_frame.grid()

    def _get_results(self):
        notice = self.notify("Notice", "Checking job statuses, please hold", timeout=len(
            self.pending_jobs)*10000)
        for job_id in list(self.pending_jobs):
            try:
                if self.API.processed(job_id):
                    self.API.save_response(job_id, self.pending_jobs[job_id])
                    self._display_result_frame()
                    self.result_field.populate(
                        job_id, self.pending_jobs[job_id])
                else:
                    self.notify("Error", "Job #{} processing has failed".format(
                        job_id), status=App.failure)
                self.pending_jobs.pop(job_id)
            except AssertionError:  # Timeout
                pass
            except Exception as error:
                self.notify("Error", str(error), status=App.failure)
                self.pending_jobs.pop(job_id)
        if notice.winfo_exists():
            notice.destroy()
        if not self.pending_jobs:
            self._processing_job = None
            return
        self.window.after(30000, self._get_results)

    def login(self):
        if self.username.get() and self.password.get():
            try:
                # INITIALIZING API, idk what the other shit is
                self.API = API(self.username.get(), self.password.get())
                self.login_indicator.config(fg=App.success)
                self.btn_session.config(state=tk.DISABLED)
                self.username_entry.config(state=tk.DISABLED)
                self.password_entry.config(state=tk.DISABLED)
                self.clear()
            except Exception as error:
                self.login_indicator.config(fg=App.failure)
                self.notify("ERROR", str(error), status=App.failure)
        else:
            self.login_indicator.config(fg=App.failure)
            self.notify(
                "ERROR", "You need to enter both a username and a password", status=App.failure)

    def select_file(self):
        file_path = tkFileDialog.askopenfilename(
            title="Select File for Upload")
        if file_path:
            self.file_path = file_path
            file_name = truncate(os.path.basename(file_path), 30)
            self.fileLabel.configure(text=file_name)
            self.file_indicator.configure(fg=App.success)

    def update(self):
        ret, frame = self.visualizer.get_frame()
        if ret:
            photo = PIL.ImageTk.PhotoImage(image=PIL.Image.fromarray(frame))
            self.image_label.configure(image=photo)
            self.image_label.image = photo
        self._playback_job = self.window.after(self.delay, self.update)

    def clear(self):
        self.categoryBar.deselect_all(
            self.categoryBar.check_buttons, dependant=False)
        for indicator in self.indicators:
            indicator.configure(fg=App.base)
        self.fileLabel.configure(text="")
        self.file_path = None

        if self.API is None:
            self.login_indicator.configure(fg=App.base)
            self.username.set("")
            self.password.set("")

    def notify(self, title, message, status=base, timeout=10000):
        print(message)
        top = tk.Toplevel(self.window)
        top.resizable(False, False)
        top.title(title)
        top.config(width=App.dimensions[0]//2)
        dialog = tk.Message(top, text=message, padx=20, pady=20)
        dialog.config(fg=status, width=350)
        dialog.grid()
        top.after(timeout, top.destroy)
        self.window.update()
        return top


class Checkbar(tk.Frame):

    def __init__(self, container, titles, child=None, targets=None):
        tk.Frame.__init__(self, container)
        self.child = child
        # {K:V} = {Key : [Btn, IntVar]}
        self.check_buttons = {}
        # {K:V} = {category_key : [target_buttons]} where target buttons are on the child
        self.target_data = {}
        index = 1
        for key in titles:
            var = tk.IntVar()
            title = key if titles[key] is None else titles[key]
            chk = tk.Checkbutton(self, text=title, variable=var,
                                 command=lambda key=key: self.handle_categories(key))
            if key == '2D':  # NOTE: required for all categories
                var.set(1)
                chk.config(state="disabled")

            self.check_buttons.update({key: [chk, var]})

            if child is not None:
                chk.grid(row=0, column=index, padx=5)
            else:
                chk.grid(row=index, column=0)
                chk.grid_remove()

            if targets is not None:
                data = []
                for target_key in targets[key]:
                    target_button = self.child.check_buttons[target_key]
                    data.append(target_button[0])
                self.target_data.update({key: data})
            index += 1

    def handle_categories(self, key):
        # called after the intvar is changed
        def _check_category(var):
            self.deselect_all(self.child.check_buttons)
            self.show_children()

        if self.child is not None:
            data = self.check_buttons[key]
            return _check_category(data[1])

    def deselect_all(self, check_buttons, dependant=True):
        for data in check_buttons.values():
            btn = data[0]
            if str(btn["state"]) != "disabled":
                data[1].set(0)
            if dependant:
                data[0].grid_remove()
        self.child.grid_remove()

    def show_children(self):
        for key, data in self.check_buttons.items():
            if data[1].get():  # selected
                self._display_targets(key)

    def get_selected(self):
        selected = []
        for key, data in self.check_buttons.items():
            if data[1].get():
                selected.append(key)
        return selected

    def _display_targets(self, category_key):
        for target in self.target_data[category_key]:
            target.grid()
        self.child.grid()


class ResultField(tk.Frame):
    def __init__(self, root, operation, api=None):
        tk.Frame.__init__(self, root)
        self.columnconfigure(0, weight=1)

        self.canvas = tk.Canvas(self, borderwidth=0)
        self.display_frame = tk.Frame(self.canvas, borderwidth=1, padx=5)
        for i in range(4):
            self.display_frame.columnconfigure(i, weight=1)
        self.vsb = tk.Scrollbar(self, orient="vertical",
                                command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.vsb.set)

        self.canvas.grid(row=0, column=0, sticky='news')
        self.vsb.grid(row=0, column=1, sticky='nse')  # TODO: was news
        self.canvas_window = self.canvas.create_window(
            (0, 0), window=self.display_frame, anchor='nw', tags="self.display_frame")  # TODO: WAS 4,4

        self.display_frame.bind("<Configure>", self.configure_frame)
        self.canvas.bind('<Configure>', self.resize_frame)

        self.canvas.config(scrollregion=self.canvas.bbox("all"), height=150)

        tk.Label(self.display_frame, text="Filename", borderwidth=3,
                 relief="groove").grid(row=0, column=0, padx=10, sticky="ew")
        tk.Label(self.display_frame, text="Details", borderwidth=3,
                 relief="groove").grid(row=0, column=1, padx=10, sticky="ew")
        tk.Label(self.display_frame, text="Results", borderwidth=3, relief="groove").grid(
            row=0, column=2, columnspan=2, padx=10, sticky="ew")

        self.row = 1
        self.api = api
        self.operation = operation

    def configure_frame(self, event):
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def resize_frame(self, event):
        canvas_width = event.width
        self.canvas.itemconfig(self.canvas_window, width=canvas_width)

    def populate(self, job_id, file_path):
        details = self.api.wrapper.get_job_details(job_id)

        file_name = truncate(details['filename'])
        fpath = os.path.split(file_path)
        message = "Job {} is processed and the following results are downloaded: \t".format(
            job_id)

        tk.Label(self.display_frame, text=file_name).grid(
            row=self.row, column=0, padx=3, sticky="news")
        selected = self._get_selected_options(details['options'])
        tk.Label(self.display_frame, text=selected).grid(
            row=self.row, column=1, padx=3, sticky="news")

        if 'annotated_media' in details['work_types']:
            result_path = os.path.join(
                fpath[0], "annotated_media-{}".format(fpath[1]))
            play_btn = tk.Button(self.display_frame, text="Annotated Media",
                                 command=lambda media_path=result_path: self.operation(media_path, processed=True))
            play_btn.grid(row=self.row, column=2, ipadx=3, sticky="news")
            message += "Annotated Media: {} \t".format(result_path)
        if 'json' in details['work_types']:
            result_path = os.path.join(fpath[0], "json-{}".format(fpath[1]))
            play_btn = tk.Button(self.display_frame, text="JSON", command=lambda media_path=file_path, json_path=result_path,
                                 options=details['options']: self.operation(media_path, json_path=json_path, options=options, processed=True))
            play_btn.grid(row=self.row, column=3, ipadx=3, sticky="news")
            message += "JSON: {}".format(result_path)
        print(message)
        self.row += 1

    def _get_selected_options(self, options):
        selected_options = "2d,"
        for option, selected in options.items():
            if selected:
                selected_options += "{}, ".format(option)
        return selected_options[:-1]


App(tk.Tk(), "wrnch Cloud API Sample")
