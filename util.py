# Util functions for app.py
from io import BytesIO
from PIL import Image
from skimage.transform import resize
import numpy as np


def convert_to_28x28_image(binary_data):
    '''
    transforms binary image data into a 28x28 array for ML processing
    :param binary_data:
    :return: np.array(28, 28)
    '''

    img = Image.open(BytesIO(binary_data))
    np_img = np.array(img)
    np_img2d = np.empty((len(np_img), len(np_img[0])))
    for i in range(len(np_img)):
        for j in range(len(np_img[0])):
            np_img2d[i, j] = np_img[i, j, 3] / 255.0
    resized_np_img2d = resize(np_img2d, (28, 28), anti_aliasing=True)
    return resized_np_img2d
