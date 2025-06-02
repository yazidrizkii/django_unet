#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Nov 15 15:47:04 2018

@author: arna2
"""
import numpy as np
import cv2

def normalization(image, max=1, min=0):
    image_new = (image - np.min(image)) * (max - min) / (np.max(image) - np.min(image)) + min
    return image_new

def clahe_equalized(image):
    if len(image.shape) == 3:  # Jika gambar memiliki lebih dari satu channel
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    if image.dtype != np.uint8:
        image = image.astype(np.uint8)
    
    #create a CLAHE object (Arguments are optional).
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    imgs_equalized = clahe.apply(image)
    
    return imgs_equalized

def adjust_gamma(image, gamma=1.0):
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
    new_image = cv2.LUT(image, table)
    
    return new_image
