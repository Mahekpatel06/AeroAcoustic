import cv2
import numpy as np
import os

img = cv2.imread("soniearth-nightlights/assets/annual_years/year_2012.jpg")
print("Year 2012 image shape:", img.shape)
print("Mean brightness:", np.mean(img))
# Check if left half and right half are duplicates
left = img[:, :img.shape[1]//2]
right = img[:, img.shape[1]//2:]
diff = np.mean(np.abs(left.astype(float) - right.astype(float)))
print("Left vs Right difference:", diff)
